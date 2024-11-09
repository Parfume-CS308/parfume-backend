import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    try {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

      if (!request.user) {
        throw new UnauthorizedException(
          'To access this resource, you need to be authenticated',
        );
      }

      const role = request.user.role;

      if (!role) {
        throw new UnauthorizedException(
          'To access this resource, you need to be authenticated',
        );
      }

      const hasRole = requiredRoles.includes(role);

      if (!hasRole) {
        throw new UnauthorizedException(
          `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    } catch (accessError) {
      if (accessError instanceof UnauthorizedException) {
        throw accessError;
      }
      Logger.error(
        'An error occured while trying to validate the user role',
        'RoleGuard',
      );
      Logger.error(accessError, 'RoleGuard');
      throw new InternalServerErrorException(
        'An error occured while trying to validate the user role',
      );
    }
  }
}
