import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  learner_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  stripe_payment_intent_id: string;

  @Prop({ default: 'pending' })
  stripe_status: string;

  @Prop({ required: true })
  amount_paid: number;

  @Prop({ default: 'usd' })
  currency: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  paid_at: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);