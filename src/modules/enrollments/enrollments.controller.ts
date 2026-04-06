import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my')
  @Roles('learner')
  @ApiOperation({
    summary: 'Get learner enrolled courses with progress (Learner only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of enrollments with course data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — mentors cannot access this',
  })
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getMyEnrollments(req.user._id);
  }

  @Patch(':id')
  @Roles('learner')
  @ApiOperation({ summary: 'Update video watch progress (Learner only)' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  updateProgress(
    @Param('id') id: string,
    @Body('watch_progress_seconds') watchProgressSeconds: number,
    @Request() req,
  ) {
    return this.enrollmentsService.updateProgress(
      id,
      req.user._id,
      watchProgressSeconds,
    );
  }
}
