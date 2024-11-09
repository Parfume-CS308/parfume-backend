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
  Get,
  UseGuards,
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
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthTokenPayload } from './interfaces/auth-types';

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
      Logger.log(
        `User login attempt: ${loginDto.email}`,
        'AuthController.login',
      );
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
      Logger.log(`User logged in: ${user.email}`, 'AuthController.login');
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          gender: user.gender,
          role: user.role,
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
      Logger.log(
        `User registration attempt: ${signUpDto.email}`,
        'AuthController.signup',
      );
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
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'sales-manager', 'product-manager')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get authenticated user details and refresh tokens',
  })
  @ApiOkResponse({
    description: 'Returns current user details',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
    type: UnauthorizedException,
  })
  async getCurrentUser(
    @User() user: AuthTokenPayload,
    @Res() res: Response,
  ): Promise<Response<LoginResponse>> {
    Logger.log(`User details requested: ${user.email}`, 'AuthController.me');
    const userData = await this.authService.getUserDetails(user.id);
    Logger.log(`User details retrieved: ${user.email}`, 'AuthController.me');
    return res.json({
      message: 'User details retrieved successfully',
      user: userData,
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate tokens',
  })
  @ApiOkResponse({
    description: 'User successfully logged out',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
    type: UnauthorizedException,
  })
  async logout(
    @User() user: AuthTokenPayload,
    @Res() res: Response,
  ): Promise<Response> {
    Logger.log(`User logout requested: ${user.email}`, 'AuthController.logout');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    Logger.log(`User logged out: ${user.email}`, 'AuthController.logout');
    return res.json({ message: 'User logged out successfully' });
  }
}
