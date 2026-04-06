import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schema/user.schema';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
  @ApiOperation({
    summary: 'Create a new course with video upload (Mentor only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — learners cannot create courses',
  })
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  create(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.create(user._id.toString(), dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated course catalog with optional filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns paginated courses list' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.coursesService.findAll({ page, limit, category, tag });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get mentor own courses (Mentor only)' })
  @ApiResponse({ status: 200, description: 'Returns mentor courses list' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — learners cannot access this',
  })
  findMyCourses(@CurrentUser() user: UserDocument) {
    return this.coursesService.findMyCoures(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course detail by ID (no video_url returned)' })
  @ApiResponse({ status: 200, description: 'Returns course detail' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update course (Mentor owner only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, user._id.toString(), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete course (Mentor owner only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.coursesService.remove(id, user._id.toString());
  }
}
