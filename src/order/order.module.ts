// src/order/order.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { CustomerModule } from '../customer/customer.module';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Customer]),
    forwardRef(() => ProductModule),
    forwardRef(() => CustomerModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}