export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'staging' | 'production' | 'test';
      PORT: string;
      MONGODB_CONNECTION_STRING: string;
      MONGODB_USER: string;
      MONGODB_PASSWORD: string;
      REDIS_CONNECTION_STRING: string;
      ACCESS_TOKEN_LIFE: string;
      REFRESH_TOKEN_LIFE: string;
      ACCESS_TOKEN_SECRET_PATH: string;
      ACCESS_TOKEN_PUBLIC_KEY_PATH: string;
      REFRESH_TOKEN_SECRET_PATH: string;
      REFRESH_TOKEN_PUBLIC_KEY_PATH: string;
    }
  }
}
