import { DynamicModule, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { EnvVault } from '../vault/env.vault';

@Module({})
export class RedisHelperModule {
  static register(): DynamicModule {
    return {
      module: RedisHelperModule,
      imports: [
        RedisModule.forRoot(
          {
            type: 'single',
            url: EnvVault.REDIS_CONNECTION_STRING,
          },
          'redis-connection',
        ),
      ],
      exports: [RedisModule],
    };
  }
}
