import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvVault } from './vault/env.vault';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { User, UserSchema } from './entities/user.entity';

@Module({
  imports: [
    MongooseModule.forRoot(EnvVault.MONGODB_CONNECTION_STRING, {
      dbName: 'perfume_point',
      auth: {
        username: EnvVault.MONGODB_USER,
        password: EnvVault.MONGODB_PASSWORD,
      },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    // NOTE: No need to import RedisHelperModule, right now
    // RedisHelperModule.register(),
    AuthModule,
    JwtModule,
  ],
})
export class AppModule {}
