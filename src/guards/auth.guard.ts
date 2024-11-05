// guards/auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthService } from '../auth/auth.service';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const accessToken = request.cookies['access_token'];
      const refreshToken = request.cookies['refresh_token'];
  
      if (!accessToken) {
        throw new UnauthorizedException('No access token provided');
      }
  
      try {
        const payload = await this.authService.validateAccessToken(accessToken);
        request['user'] = payload;
        return true;
      } catch (accessError) {
        // If access token is invalid, try refresh token
        if (!refreshToken) {
          throw new UnauthorizedException('No refresh token provided');
        }
  
        try {
          const refreshPayload =
            await this.authService.validateRefreshToken(refreshToken);
          const { id, email } = refreshPayload;
  
          // Generate new tokens
          const tokens = await this.authService.generateAuthTokens(id, email);
  
          // Set new cookies in response
          const response = context.switchToHttp().getResponse();
          response.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
  
          response.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
  
          request['user'] = { id, email };
          return true;
        } catch (refreshError) {
          throw new UnauthorizedException('Invalid tokens');
        }
      }
    }
  }
  