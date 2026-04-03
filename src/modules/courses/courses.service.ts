import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import { CloudinaryService } from './cloudinary.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { generateThumbnail, getVideoDuration } from '../../common/utils/thumbnail.util';
import { Course, CourseDocument } from './schema/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    mentorId: string,
    dto: CreateCourseDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Video file is required');

    const allowedFormats = ['video/mp4', 'video/webm'];
    if (!allowedFormats.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Only mp4 and webm formats are allowed');
    }

    const duration = await getVideoDuration(file.path);
    if (duration > 300) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Video must not exceed 5 minutes (300 seconds)');
    }

    const thumbnailPath = await generateThumbnail(file.path);
    const [videoUpload, thumbnailUpload] = await Promise.all([
      this.cloudinaryService.uploadVideo(file.path),
      this.cloudinaryService.uploadImage(thumbnailPath),
    ]);

    fs.unlinkSync(file.path);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

    const course = await this.courseModel.create({
      mentor_id: new Types.ObjectId(mentorId),
      ...dto,
      video_url: videoUpload.url,
      video_public_id: videoUpload.public_id,
      thumbnail_url: thumbnailUpload.url,
      video_duration: duration,
      video_format: file.mimetype.split('/')[1],
      is_published: true,
    });

    return course;
  }

  async findAll(query: { page?: number; limit?: number; category?: string; tag?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { is_published: true };
    if (query.category) filter.category = query.category;
    if (query.tag) filter.tags = { $in: [query.tag] };

    const [courses, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .select('-video_url')
        .populate('mentor_id', 'name avatar_url')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.courseModel.countDocuments(filter),
    ]);

    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const course = await this.courseModel
      .findById(id)
      .select('-video_url')
      .populate('mentor_id', 'name avatar_url');

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findMyCoures(mentorId: string) {
    return this.courseModel
      .find({ mentor_id: new Types.ObjectId(mentorId) })
      .select('-video_url')
      .sort({ createdAt: -1 });
  }

  async update(courseId: string, mentorId: string, dto: UpdateCourseDto) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.mentor_id.toString() !== mentorId) {
      throw new ForbiddenException('You do not own this course');
    }

    Object.assign(course, dto);
    await course.save();
    return course;
  }

  async remove(courseId: string, mentorId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.mentor_id.toString() !== mentorId) {
      throw new ForbiddenException('You do not own this course');
    }

    await course.deleteOne();
    return { message: 'Course deleted successfully' };
  }

  async findByIdWithVideoUrl(courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}