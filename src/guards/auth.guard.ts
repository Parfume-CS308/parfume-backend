// guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    if (!accessToken) {
      throw new UnauthorizedException(
        'To access this resource, you need to be authenticated',
      );
    }

    try {
      const payload = await this.authService.validateAccessToken(accessToken);
      request['user'] = payload;
      return true;
    } catch (accessError) {
      if (!refreshToken) {
        throw new UnauthorizedException(
          'To access this resource, you need to be authenticated',
        );
      }

      try {
        const refreshPayload =
          await this.authService.validateRefreshToken(refreshToken);
        const { id, email, role } = refreshPayload;

        const tokens = await this.authService.generateAuthTokens(
          id,
          email,
          role,
        );

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

        request['user'] = refreshPayload;
        return true;
      } catch (refreshError) {
        throw new UnauthorizedException(
          'To access this resource, you need to be authenticated',
        );
      }
    }
  }
}
