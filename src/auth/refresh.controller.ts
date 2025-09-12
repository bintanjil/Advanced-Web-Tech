import { Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class RefreshController {
  constructor(private authService: AuthService) {}

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      // Get the refresh token from cookies
      const refreshToken = request.cookies['refreshToken'];
      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token');
      }

      // Verify and generate new tokens
      const result = await this.authService.refreshToken(refreshToken);

      // Set new JWT token in HttpOnly cookie
      response.cookie('jwtToken', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      // Set new refresh token
      response.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { message: 'Token refreshed successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
