import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminModule } from '../admin/admin.module';
import { jwtConstants } from './auth.constants';
import { AuthGuard } from './auth.guard';
import { SellerModule } from '../seller/seller.module';

@Module({
  imports: [
    AdminModule,
    SellerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: AuthGuard,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule {}