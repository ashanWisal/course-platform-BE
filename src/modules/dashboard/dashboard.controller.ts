import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('mentor')
  @Roles('mentor')
  getMentorDashboard(@Request() req) {
    return this.dashboardService.getMentorDashboard(req.user._id);
  }

  @Get('learner')
  @Roles('learner')
  getLearnerDashboard(@Request() req) {
    return this.dashboardService.getLearnerDashboard(req.user._id);
  }
}