// auth.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { EnvVault } from 'src/vault/env.vault';
import { LoginResponse } from './models/login.response';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<LoginResponse> {
    try {
      const { access_token, refresh_token, user } =
        await this.authService.login(loginDto);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: EnvVault.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: EnvVault.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          gender: user.gender,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
