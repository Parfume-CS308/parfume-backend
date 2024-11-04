// auth.service.ts
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { compare } from 'bcryptjs';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { EnvVault } from 'src/vault/env.vault';
import { KeyVault } from 'src/vault/key.vault';
import { JwtService } from '@nestjs/jwt';
import { ValidateUserInterface } from './interfaces/validate-user';
import { LoginResponse } from './interfaces/login-user';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidateUserInterface> {
    const user = await this.UserModel.findOne(
      { email },
      {
        _id: 1,
        password: 1,
        active: 1,
        firstName: 1,
        lastName: 1,
        age: 1,
        gender: 1,
      },
    ).lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Credentials not valid, please try again',
      );
    }

    if (!user.active) {
      throw new UnauthorizedException(
        'Account is inactive, please contact support',
      );
    }
    return {
      _id: user._id as Types.ObjectId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;
      const user = await this.validateUser(email, password);
      const stringifiedId = user._id.toString();
      const tokens = await this.generateAuthTokens(stringifiedId, email);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: stringifiedId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
          gender: user.gender,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async generateAuthTokens(id: string, email: string) {
    const access_token = await this.jwtService.signAsync(
      {
        id,
        email,
      },
      {
        algorithm: 'RS256',
        privateKey: KeyVault.ACCESS_TOKEN_SECRET,
        expiresIn: EnvVault.ACCESS_TOKEN_LIFE,
      },
    );

    const refresh_token = await this.jwtService.signAsync(
      {
        id,
        email,
      },
      {
        algorithm: 'RS256',
        privateKey: KeyVault.REFRESH_TOKEN_SECRET,
        expiresIn: EnvVault.REFRESH_TOKEN_LIFE,
      },
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: KeyVault.ACCESS_TOKEN_PUBLIC,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: KeyVault.REFRESH_TOKEN_PUBLIC,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
