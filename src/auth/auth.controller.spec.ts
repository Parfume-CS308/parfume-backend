import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRoleEnum } from '../enums/entity.enums';
import {
  AuthTokenPayload,
  AuthenticateUserResponse,
} from './interfaces/auth-types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
    getUserDetails: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockResponse = {
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'batuhanisildak@sabanciuniv.edu',
      password: 'Test1234!',
    };

    const mockLoginResponse: AuthenticateUserResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'user-id',
        email: 'batuhanisildak@sabanciuniv.edu',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        gender: 'male',
        role: UserRoleEnum.CUSTOMER,
      },
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      await controller.login(mockLoginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockLoginResponse.access_token,
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockLoginResponse.refresh_token,
        expect.any(Object),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: mockLoginResponse.user,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login(mockLoginDto, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when login dto is invalid', async () => {
      const invalidLoginDto = {
        email: 'invalid-email',
        password: 'short',
      };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Invalid input'),
      );

      await expect(
        controller.login(invalidLoginDto as LoginDto, mockResponse),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('signup', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'batuhanisildak@sabanciuniv.edu',
      password: 'Test1234!',
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      gender: 'male',
    };

    const mockSignUpResponse: AuthenticateUserResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'user-id',
        email: 'batuhanisildak@sabanciuniv.edu',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        gender: 'male',
        role: UserRoleEnum.CUSTOMER,
      },
    };

    it('should successfully register a new user', async () => {
      mockAuthService.signup.mockResolvedValue(mockSignUpResponse);

      await controller.signup(mockSignUpDto, mockResponse);

      expect(authService.signup).toHaveBeenCalledWith(mockSignUpDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: mockSignUpResponse.user,
      });
    });

    it('should throw BadRequestException when signup dto validation fails', async () => {
      const invalidSignUpDto = {
        email: 'invalid-email',
        password: 'short',
        firstName: 'J',
        lastName: 'D',
        age: 10,
        gender: 'invalid',
      };

      mockAuthService.signup.mockRejectedValue(
        new BadRequestException('Invalid input'),
      );

      await expect(
        controller.signup(invalidSignUpDto as SignUpDto, mockResponse),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentUser', () => {
    const mockAuthTokenPayload: AuthTokenPayload = {
      id: 'user-id',
      email: 'batuhanisildak@sabanciuniv.edu',
      role: UserRoleEnum.CUSTOMER,
    };

    const mockUserDetails = {
      id: 'user-id',
      email: 'batuhanisildak@sabanciuniv.edu',
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      gender: 'male',
      role: UserRoleEnum.CUSTOMER,
    };

    it('should return current user details', async () => {
      mockAuthService.getUserDetails.mockResolvedValue(mockUserDetails);

      await controller.getCurrentUser(mockAuthTokenPayload, mockResponse);

      expect(authService.getUserDetails).toHaveBeenCalledWith(
        mockAuthTokenPayload.id,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User details retrieved successfully',
        user: mockUserDetails,
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockAuthService.getUserDetails.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        controller.getCurrentUser(mockAuthTokenPayload, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const mockAuthTokenPayload: AuthTokenPayload = {
      id: 'user-id',
      email: 'batuhanisildak@sabanciuniv.edu',
      role: UserRoleEnum.CUSTOMER,
    };

    it('should successfully logout user', async () => {
      await controller.logout(mockAuthTokenPayload, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User logged out successfully',
      });
    });
  });

  describe('updateProfile', () => {
    const mockAuthTokenPayload: AuthTokenPayload = {
      id: 'user-id',
      email: 'batuhanisildak@sabanciuniv.edu',
      role: UserRoleEnum.CUSTOMER,
    };

    const mockUpdateProfileDto: UpdateProfileDto = {
      password: 'NewTest1234!',
      firstName: 'John',
      lastName: 'Doe',
      age: 26,
      gender: 'male',
    };

    it('should successfully update user profile', async () => {
      mockAuthService.updateProfile.mockResolvedValue(undefined);

      await controller.updateProfile(
        mockAuthTokenPayload,
        mockUpdateProfileDto,
        mockResponse,
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(
        mockAuthTokenPayload.id,
        mockUpdateProfileDto,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Profile information has been updated successfully',
      });
    });

    it('should throw BadRequestException when update profile dto validation fails', async () => {
      const invalidUpdateProfileDto = {
        password: 'short',
        firstName: 'J',
        lastName: 'D',
        age: 10,
        gender: 'invalid',
      };

      mockAuthService.updateProfile.mockRejectedValue(
        new BadRequestException('Invalid input'),
      );

      await expect(
        controller.updateProfile(
          mockAuthTokenPayload,
          invalidUpdateProfileDto as UpdateProfileDto,
          mockResponse,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      mockAuthService.updateProfile.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        controller.updateProfile(
          mockAuthTokenPayload,
          mockUpdateProfileDto,
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
