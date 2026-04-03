import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('learner')
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user._id);
  }

  @Post(':id/confirm')
  @Roles('learner')
  confirm(@Param('id') id: string, @Request() req) {
    return this.ordersService.confirm(id, req.user._id);
  }

  @Get('my')
  @Roles('learner')
  getMyOrders(@Request() req) {
    return this.ordersService.getMyOrders(req.user._id);
  }
}