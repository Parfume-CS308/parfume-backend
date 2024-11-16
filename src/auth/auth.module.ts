import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { IsUserAlreadyExist } from './validators/user-exists.validator';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, IsUserAlreadyExist, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
