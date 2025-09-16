import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { PusherModule } from './pusher/pusher.module';
import { ProductService } from './product/product.service';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin/admin.entity';
import { Seller } from './seller/seller.entity';
import { Product } from './product/product.entity';
import { Customer } from './customer/customer.entity';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { OrderModule } from './order/order.module';
import { Address } from './customer/address.entity';
import { Review } from './review/review.entity';
import { Discount } from './discount/discount.entity';
import { Category } from './category/category.entity';
import { CategoryModule } from './category/category.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: 'localhost',
      port: 5432,
      username:'postgres',
      password:'admin',
      database:'ecommerce',
      entities:[Admin, Customer, Seller, Product, Order, OrderItem, Address, Review, Discount, Category],
      synchronize:true,


    }),
    AdminModule, 
    ProductModule, 
    CustomerModule, 
    AuthModule, 
    MailModule, 
    OrderModule,
    PusherModule,
    CategoryModule
  ],
  controllers: [],
  providers: [],
  
})
export class AppModule {}
