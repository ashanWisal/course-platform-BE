import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  learner_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order_id: Types.ObjectId;

  @Prop({ default: 0 })
  watch_progress_seconds: number;

  @Prop({ default: false })
  is_completed: boolean;

  @Prop()
  last_watched_at: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Prevent duplicate enrollments at DB level
EnrollmentSchema.index({ learner_id: 1, course_id: 1 }, { unique: true });