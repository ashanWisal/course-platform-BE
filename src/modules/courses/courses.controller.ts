import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFile,
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

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
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
  findMyCourses(@CurrentUser() user: UserDocument) {
    return this.coursesService.findMyCoures(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mentor')
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
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.coursesService.remove(id, user._id.toString());
  }
}