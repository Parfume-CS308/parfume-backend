import { UserRoleEnum } from 'src/enums/entity.enums';

export interface UserBasicInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  role: UserRoleEnum;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRoleEnum;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthenticateUserResponse extends AuthTokens {
  user: UserBasicInfo;
}
