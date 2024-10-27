import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvVault } from './vault/env.vault';
import { RedisHelperModule } from './redis/redis_helper.module';

@Module({
  imports: [
    MongooseModule.forRoot(EnvVault.MONGODB_CONNECTION_STRING, {
      dbName: 'fsa',
      auth: {
        username: EnvVault.MONGODB_USER,
        password: EnvVault.MONGODB_PASSWORD,
      },
    }),
    RedisHelperModule.register(),
  ],
})
export class AppModule {}
