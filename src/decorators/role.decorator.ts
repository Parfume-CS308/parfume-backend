import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'Role_Guard';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
