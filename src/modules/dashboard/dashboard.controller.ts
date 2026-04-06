import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('mentor')
  @Roles('mentor')
  @ApiOperation({
    summary:
      'Get mentor dashboard — revenue and sales per course (Mentor only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns courses with total_sales and total_revenue',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — learners cannot access mentor dashboard',
  })
  getMentorDashboard(@Request() req) {
    return this.dashboardService.getMentorDashboard(req.user._id);
  }

  @Get('learner')
  @Roles('learner')
  @ApiOperation({
    summary:
      'Get learner dashboard — enrolled courses with progress (Learner only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns enrollments with course data and progress',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — mentors cannot access learner dashboard',
  })
  getLearnerDashboard(@Request() req) {
    return this.dashboardService.getLearnerDashboard(req.user._id);
  }
}
