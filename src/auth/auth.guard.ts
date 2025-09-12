import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './auth.constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookies(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret
      });
      
      // Store the payload in request for later use
      request.user = payload;

      // Check role-based access if roles are specified
      const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      // If token is expired, try to refresh using refresh token
      const refreshToken = this.extractRefreshTokenFromCookies(request);
      if (refreshToken) {
        try {
          const newPayload = await this.jwtService.verifyAsync(refreshToken, {
            secret: jwtConstants.refreshSecret
          });
          
          // Generate new access token
          const newAccessToken = await this.jwtService.signAsync(
            {
              sub: newPayload.sub,
              email: newPayload.email,
              role: newPayload.role
            },
            {
              secret: jwtConstants.secret,
              expiresIn: '1h'
            }
          );

          // Set new access token in cookie
          const response = context.switchToHttp().getResponse();
          response.cookie('jwtToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
          });

          // Store the new payload in request
          request.user = newPayload;
          return true;
        } catch (refreshError) {
          throw new UnauthorizedException('Session expired. Please login again.');
        }
      }

      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies['jwtToken'];
  }

  private extractRefreshTokenFromCookies(request: Request): string | undefined {
    return request.cookies['refreshToken'];
  }
}