import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Stream')
@ApiBearerAuth('JWT-auth')
@Controller('stream')
@UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':courseId')
  @ApiOperation({
    summary: 'Stream video for enrolled learner — proxied through server',
  })
  @ApiResponse({
    status: 206,
    description: 'Partial video content streamed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — invalid or missing JWT',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — not enrolled in this course',
  })
  @ApiResponse({ status: 404, description: 'Course or video not found' })
  async streamVideo(
    @Param('courseId') courseId: string,
    @Req() req: ExpressRequest & { user: any },
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    return this.streamService.streamVideo(courseId, req.user._id, req, res);
  }
}
