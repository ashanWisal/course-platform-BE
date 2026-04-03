import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { Course, CourseSchema } from '../courses/schema/course.schema';
import { Enrollment, EnrollmentSchema } from '../enrollments/schema/enrollment.schema';
import { CloudinaryService } from '../courses/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [StreamController],
  providers: [StreamService, CloudinaryService], 
})
export class StreamModule {}