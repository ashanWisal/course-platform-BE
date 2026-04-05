import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../courses/schema/course.schema';
import { Enrollment, EnrollmentDocument } from '../enrollments/schema/enrollment.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async getMentorDashboard(mentorId: string) {
    const courses = await this.courseModel
      .find({ mentor_id: new Types.ObjectId(mentorId) })
      .select('title thumbnail_url total_sales total_revenue price createdAt')
      .sort({ createdAt: -1 });

    const totalRevenue = courses.reduce((sum, c) => sum + c.total_revenue, 0);
    const totalSales = courses.reduce((sum, c) => sum + c.total_sales, 0);

    return { totalRevenue, totalSales, courses };
  }

  async getLearnerDashboard(learnerId: string) {
    const enrollments = await this.enrollmentModel
      .find({ learner_id: new Types.ObjectId(learnerId) })
      .populate('course_id', 'title thumbnail_url video_duration price')
      .sort({ createdAt: -1 });

    return { enrollments };
  }
}