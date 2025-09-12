import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.signIn(loginDto.email, loginDto.password);

      // Set access token in HTTP-only cookie
      response.cookie('jwtToken', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
        path: '/'
      });

      // Set refresh token in HTTP-only cookie
      response.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      // Return user data without tokens
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwtToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('verify')
  async verify(@Req() request: Request) {
    try {
      const token = request.cookies['jwtToken'];
      if (!token) {
        throw new UnauthorizedException('No token found');
      }

      const decoded = await this.authService.decodeToken(token);
      return { 
        user: {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}