import { config } from 'dotenv';

config({
  path:
    process.env.NODE_ENV === 'development' ? './.env.development' : './.env',
});

export class EnvVault {
  static NODE_ENV = process.env.NODE_ENV;

  static PORT: number = Number(process.env.PORT);

  static MONGODB_CONNECTION_STRING: string =
    process.env.MONGODB_CONNECTION_STRING;

  static MONGODB_USER: string = process.env.MONGODB_USER;

  static MONGODB_PASSWORD: string = process.env.MONGODB_PASSWORD;

  static REDIS_CONNECTION_STRING: string = process.env.REDIS_CONNECTION_STRING;

  static ACCESS_TOKEN_LIFE: number = parseFloat(process.env.ACCESS_TOKEN_LIFE);

  static REFRESH_TOKEN_LIFE: number = parseFloat(
    process.env.REFRESH_TOKEN_LIFE,
  );

  static ACCESS_TOKEN_SECRET_PATH: string =
    process.env.ACCESS_TOKEN_SECRET_PATH;

  static REFRESH_TOKEN_SECRET_PATH: string =
    process.env.REFRESH_TOKEN_SECRET_PATH;
}