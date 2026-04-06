import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/schema/user.schema';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.LEARNER)
  @ApiOperation({
    summary: 'Create a Stripe PaymentIntent and save order (Learner only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created, returns clientSecret',
  })
  @ApiResponse({ status: 400, description: 'Already enrolled in this course' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — mentors cannot enroll',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user._id);
  }

  @Post(':id/confirm')
  @Roles(UserRole.LEARNER)
  @ApiOperation({
    summary: 'Confirm payment and create enrollment record (Learner only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment confirmed, enrollment created',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  confirm(@Param('id') id: string, @Request() req) {
    return this.ordersService.confirm(id, req.user._id);
  }

  @Get('my')
  @Roles(UserRole.LEARNER)
  @ApiOperation({ summary: 'Get learner order history (Learner only)' })
  @ApiResponse({ status: 200, description: 'Returns list of orders' })
  getMyOrders(@Request() req) {
    return this.ordersService.getMyOrders(req.user._id);
  }
}
