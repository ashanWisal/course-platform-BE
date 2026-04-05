import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schema/enrollment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async getMyEnrollments(learnerId: string) {
    return this.enrollmentModel
      .find({ learner_id: new Types.ObjectId(learnerId) })
      .populate('course_id', 'title thumbnail_url price video_duration category')
      .sort({ createdAt: -1 });
  }

async updateProgress(enrollmentId: string, learnerId: string, watchProgressSeconds: number) {
  const enrollment = await this.enrollmentModel.findById(enrollmentId);
  if (!enrollment) throw new NotFoundException('Enrollment not found');

  // Fix: use Types.ObjectId comparison instead of string comparison
  if (!enrollment.learner_id.equals(new Types.ObjectId(learnerId))) {
    throw new ForbiddenException('You do not own this enrollment');
  }

  enrollment.watch_progress_seconds = watchProgressSeconds;
  enrollment.last_watched_at = new Date();
  return enrollment.save();
}
}