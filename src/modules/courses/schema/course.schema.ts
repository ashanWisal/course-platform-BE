import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  mentor_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: null })
  video_url: string;

  @Prop({ default: null })
  video_public_id: string;

  @Prop({ default: null })
  thumbnail_url: string;

  @Prop({ default: null })
  video_duration: number;

  @Prop({ default: null })
  video_format: string;

  @Prop({ default: false })
  is_published: boolean;

  @Prop({ default: 0 })
  total_sales: number;

  @Prop({ default: 0 })
  total_revenue: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
