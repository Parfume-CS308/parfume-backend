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
  Logger,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { EnvVault } from 'src/vault/env.vault';
import { LoginResponse } from './models/login.response';
import { SignUpResponse } from './models/signup.response';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and generate access token',
  })
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
  ): Promise<Response<LoginResponse>> {
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

      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          gender: user.gender,
        },
      });
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

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account, and make the user logged in',
  })
  @ApiBody({
    type: SignUpDto,
    description: 'User registration details',
    examples: {
      userRegistration: {
        summary: 'Sample registration data',
        value: {
          email: 'user@example.com',
          password: 'Test1234!',
          firstName: 'John',
          lastName: 'Doe',
          age: 25,
          gender: 'male',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'User successfully registered',
    type: SignUpResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input provided',
    type: BadRequestException,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred',
    type: InternalServerErrorException,
  })
  async signup(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<Response<SignUpResponse>> {
    try {
      const { access_token, refresh_token, user } =
        await this.authService.signup(signUpDto);

      Logger.log(
        `User registered: ${user.email}, setting tokens`,
        'AuthController.signup',
      );
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
      Logger.log(`Tokens set for user: ${user.email}`, 'AuthController.signup');
      return res.json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          gender: user.gender,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
