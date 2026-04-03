import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
const StripeClient = require('stripe');
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schema/enrollment.schema';
import { Course, CourseDocument } from '../courses/schema/course.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schema/order.schema';
import Stripe, { type Stripe as StripeType } from 'stripe';

@Injectable()
export class OrdersService {
  private stripe: Stripe.Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {
    this.stripe = new StripeClient(process.env.STRIPE_SECRET_KEY as string);
  }

  async create(createOrderDto: CreateOrderDto, learnerId: string) {
    const course = await this.courseModel.findById(createOrderDto.course_id);
    if (!course) throw new NotFoundException('Course not found');

    // Check already enrolled
    const existing = await this.enrollmentModel.findOne({
      learner_id: new Types.ObjectId(learnerId),
      course_id: new Types.ObjectId(createOrderDto.course_id),
    });
    if (existing)
      throw new BadRequestException('Already enrolled in this course');

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // convert to cents
      currency: 'usd',
      metadata: {
        course_id: createOrderDto.course_id.toString(), // ✅ toString()
        learner_id: learnerId.toString(),
      },
    });

    // Save order
    const order = await this.orderModel.create({
      learner_id: new Types.ObjectId(learnerId),
      course_id: new Types.ObjectId(createOrderDto.course_id),
      stripe_payment_intent_id: paymentIntent.id,
      stripe_status: paymentIntent.status,
      amount_paid: course.price,
      currency: 'usd',
      status: 'pending',
    });

    return { order, clientSecret: paymentIntent.client_secret };
  }

  async confirm(orderId: string, learnerId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Mark order completed
    order.status = 'completed';
    order.stripe_status = 'succeeded';
    order.paid_at = new Date();
    await order.save();

    // Create enrollment
    const enrollment = await this.enrollmentModel.create({
      learner_id: order.learner_id,
      course_id: order.course_id,
      order_id: order._id,
    });

    // Update course stats
    await this.courseModel.findByIdAndUpdate(order.course_id, {
      $inc: { total_sales: 1, total_revenue: order.amount_paid },
    });

    return enrollment;
  }

  async getMyOrders(learnerId: string) {
    return this.orderModel
      .find({ learner_id: new Types.ObjectId(learnerId) })
      .populate('course_id', 'title thumbnail_url price')
      .sort({ createdAt: -1 });
  }
}
