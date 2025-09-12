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

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: role 
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h'
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: role
      },
      
    };
  }

  async decodeToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, { secret: jwtConstants.secret });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const decoded = await this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret,
      });

      // Get user data from token
      const { sub, email, role } = decoded;

      // Create new payload
      const payload = {
        sub,
        email,
        role,
      };

      // Generate new access token
      const access_token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '1h',
      });

      // Generate new refresh token
      const refresh_token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '7d', // 7 days, matching the cookie expiry
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
