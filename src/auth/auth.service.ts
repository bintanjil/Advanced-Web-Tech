import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SellerService } from '../seller/seller.service'; 
import { AdminService } from 'src/admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private sellerService: SellerService, 
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    
    let user = await this.adminService.findByEmail(email);
    let role = 'admin';

    
    if (!user) {
      user = await this.sellerService.findByEmail(email);
      role = 'seller';
    }

    
    if (!user) throw new UnauthorizedException('No user found with this email');

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    
    const payload = {
      sub: user.id,
      email: user.email,
      role: role, 
    };
    
    console.log('Auth payload:', payload);

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '1h',
      }),
    };
  }

  async decodeToken(token: string): Promise<any> {
  try {
    return this.jwtService.verify(token, { secret: jwtConstants.secret });
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
}