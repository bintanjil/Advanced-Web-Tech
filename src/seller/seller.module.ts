import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './seller.entity';
import { Product } from '../product/product.entity';
import { Order } from '../order/order.entity';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { AdminModule } from 'src/admin/admin.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constants';
import { PusherModule } from '../pusher/pusher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seller, Product, Order]),
    forwardRef(() => AdminModule),
    MailModule,
    PusherModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}