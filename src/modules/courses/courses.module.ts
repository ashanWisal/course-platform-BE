import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { Course, CourseSchema } from './schema/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    ConfigModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CloudinaryService, CloudinaryProvider],
  exports: [MongooseModule, CoursesService],
})
export class CoursesModule {}