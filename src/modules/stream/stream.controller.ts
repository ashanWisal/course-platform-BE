import { Controller, Get, Param, Req, Res, Response, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Controller('stream')
@UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':courseId')
  async streamVideo(
    @Param('courseId') courseId: string,
    @Req() req: ExpressRequest & { user: any },
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    return this.streamService.streamVideo(courseId, req.user._id, req, res);
  }
}