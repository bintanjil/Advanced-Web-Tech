import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AddOrderDto } from './dto/add-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // New endpoint for seller to update order status
  @Put(':id/status')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Request() req
  ) {
    return this.orderService.updateOrderStatus(orderId, req.user.sub, updateStatusDto.status);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.CUSTOMER)
  async createOrder(@Body() addOrderDto: AddOrderDto, @Request() req) {
    return await this.orderService.createOrder(addOrderDto, req.user.sub);
  }

  @Get('customer/my-orders')
  @UseGuards(AuthGuard)
  @Roles(Role.CUSTOMER)
  async getCustomerOrders(@Request() req) {
    return await this.orderService.getCustomerOrders(req.user.sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getOrders(@Request() req) {
    const { role, sub } = req.user;

    switch (role) {
      case Role.ADMIN:
        return await this.orderService.getAllOrders();
      case 'seller':
        return await this.orderService.getSellerOrders(parseInt(sub));
      case 'customer':
        return await this.orderService.getCustomerOrders(sub);
      default:
        throw new ForbiddenException('Unauthorized access');
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.CUSTOMER)
  async getOrderById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const order = await this.orderService.getOrderById(id);
    const { role, sub } = req.user;

    // Admin can access all orders
    if (role === 'admin') {
      return order;
    }

    // Seller can access orders containing their products
    if (role === 'seller') {
      const hasSellerProducts = order.orderItems.some(
        item => item.product.seller.id === parseInt(sub)
      );
      if (!hasSellerProducts) {
        throw new ForbiddenException('You can only access orders containing your products');
      }
      return order;
    }

    // Customer can only access their own orders
    if (role === 'customer' && order.customer?.id !== sub) {
      throw new ForbiddenException('You can only access your own orders');
    }

    return order;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    const order = await this.orderService.getOrderById(id);
    const { role, sub } = req.user;

    // Admin can update all orders
    if (role === 'admin') {
      return await this.orderService.updateOrder(id, updateOrderDto);
    }

    // Seller can update status of orders containing their products
    if (role === 'seller') {
      const hasSellerProducts = order.orderItems.some(
        item => item.product.seller.id === parseInt(sub)
      );
      if (!hasSellerProducts) {
        throw new ForbiddenException('You can only update orders containing your products');
      }
      // Sellers can only update status
      const { status } = updateOrderDto;
      if (!status) {
        throw new ForbiddenException('Invalid update data');
      }
      return await this.orderService.updateOrder(id, { status });
    }

    // Customer can only cancel their own orders if not shipped
    if (role === 'customer') {
      if (order.customer?.id !== sub) {
        throw new ForbiddenException('You can only update your own orders');
      }
      if (updateOrderDto.status && updateOrderDto.status !== 'cancelled') {
        throw new ForbiddenException('Customers can only cancel orders');
      }
      if (order.status === 'shipped' || order.status === 'delivered') {
        throw new ForbiddenException('Cannot cancel shipped or delivered orders');
      }
      return await this.orderService.updateOrder(id, { status: 'cancelled' });
    }

    throw new ForbiddenException('Unauthorized access');
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancelOrder(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const order = await this.orderService.getOrderById(id);
    const { role, sub } = req.user;

    // Verify permissions
    if (role === 'customer' && order.customer?.id !== sub) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (role === 'seller') {
      const hasSellerProducts = order.orderItems.some(
        item => item.product.seller.id === parseInt(sub)
      );
      if (!hasSellerProducts) {
        throw new ForbiddenException('You can only cancel orders containing your products');
      }
    }

    return await this.orderService.cancelOrder(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return await this.orderService.cancelOrder(id);
  }
}