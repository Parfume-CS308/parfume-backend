import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { UserRoleEnum } from 'src/enums/entity.enums';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn().mockImplementation(() => ({
      lean: jest.fn(),
    })),
    findById: jest.fn().mockImplementation(() => ({
      lean: jest.fn(),
    })),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user info if email and password are valid', async () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      password: 'hashedPassword',
      active: true,
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      role: 'customer',
    };
    mockUserModel.findOne.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(mockUser),
    });
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', 'password');

    expect(mockUserModel.findOne).toHaveBeenCalledWith(
      { email: 'test@example.com' },
      expect.any(Object),
    );
    expect(compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(result).toEqual({
      id: mockUser._id.toHexString(),
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      role: 'customer',
    });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserModel.findOne.mockResolvedValue(null);
    await expect(
      service.validateUser('test@example.com', 'password'),
    ).rejects.toThrow();
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const mockUser = { password: 'hashedPassword' };
    mockUserModel.findOne.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.validateUser('test@example.com', 'password'),
    ).rejects.toThrow();
  });

  it('should throw UnauthorizedException if account is inactive', async () => {
    const mockUser = { password: 'hashedPassword', active: false };
    mockUserModel.findOne.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.validateUser('test@example.com', 'password'),
    ).rejects.toThrow();
  });

  it('should return tokens and user info on successful login', async () => {
    const mockUser = {
      id: 'mockId',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      role: 'customer' as UserRoleEnum,
    };
    jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
    mockJwtService.signAsync
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(service.validateUser).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
      user: mockUser,
    });
  });

  it('should throw InternalServerErrorException if an error occurs', async () => {
    jest.spyOn(service, 'validateUser').mockRejectedValue(new Error());
    await expect(
      service.login({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow();
  });
});
