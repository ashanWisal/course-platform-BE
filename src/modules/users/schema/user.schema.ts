import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MENTOR = 'mentor',
  LEARNER = 'learner',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ default: null })
  avatar_url: string;
}

export const UserSchema = SchemaFactory.createForClass(User);