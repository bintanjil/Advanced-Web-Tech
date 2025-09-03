import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthService } from 'src/auth/auth.service';
import { SellerModule } from 'src/seller/seller.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => SellerModule),
    MailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AuthService],
  exports: [AdminService],
})
export class AdminModule {}