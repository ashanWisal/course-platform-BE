import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../courses/schema/course.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schema/enrollment.schema';
import { CloudinaryService } from '../courses/cloudinary.service';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class StreamService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async streamVideo(
    courseId: string,
    learnerId: string,
    req: ExpressRequest,
    res: ExpressResponse,
  ) {
    // 1. Check enrollment
    const enrollment = await this.enrollmentModel.findOne({
      course_id: new Types.ObjectId(courseId),
      learner_id: new Types.ObjectId(learnerId),
    });
    if (!enrollment)
      throw new ForbiddenException('You are not enrolled in this course');

    // 2. Get course with video_public_id
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (!course.video_public_id) throw new NotFoundException('Video not found');

    // 3. Generate signed URL (server-side only, expires in 60s)
    const signedUrl = this.cloudinaryService.getSignedUrl(
      course.video_public_id,
    );

    // 4. Forward range header from browser to Cloudinary
    const rangeHeader = req.headers['range'];
    const requestHeaders: Record<string, string> = {};
    if (rangeHeader) requestHeaders['Range'] = rangeHeader;

    // 5. Pipe video bytes from Cloudinary to browser
    const protocol = signedUrl.startsWith('https') ? https : http;

    protocol.get(signedUrl, { headers: requestHeaders }, (cloudinaryRes) => {
      if (
        cloudinaryRes.statusCode === 403 ||
        cloudinaryRes.statusCode === 404
      ) {
        res.status(502).json({ message: 'Video source unavailable' });
        return;
      }

      res.setHeader(
        'Content-Type',
        cloudinaryRes.headers['content-type'] || 'video/mp4',
      );
      res.setHeader('Accept-Ranges', 'bytes');

      if (cloudinaryRes.headers['content-length']) {
        res.setHeader(
          'Content-Length',
          cloudinaryRes.headers['content-length'],
        );
      }
      if (cloudinaryRes.headers['content-range']) {
        res.setHeader('Content-Range', cloudinaryRes.headers['content-range']);
      }

      res.status(cloudinaryRes.statusCode || 200);
      cloudinaryRes.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent)
          res.status(500).json({ message: 'Stream interrupted' });
      });
      cloudinaryRes.pipe(res);
    });
  }
}
