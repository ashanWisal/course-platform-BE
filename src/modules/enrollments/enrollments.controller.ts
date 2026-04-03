import { Controller, Get, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my')
  @Roles('learner')
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getMyEnrollments(req.user._id);
  }

  @Patch(':id')
  @Roles('learner')
  updateProgress(
    @Param('id') id: string,
    @Body('watch_progress_seconds') watchProgressSeconds: number,
    @Request() req,
  ) {
    return this.enrollmentsService.updateProgress(id, req.user._id, watchProgressSeconds);
  }
}