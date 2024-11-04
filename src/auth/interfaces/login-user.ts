export interface LoginUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: LoginUserResponse;
}
