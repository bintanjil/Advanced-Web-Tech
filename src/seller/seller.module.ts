import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './seller.entity';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { AdminModule } from 'src/admin/admin.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seller]),
    forwardRef(() => AdminModule),
    MailModule,
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