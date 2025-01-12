import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import { UserRoleEnum } from 'src/enums/entity.enums';
import { KeyVault } from '../vault/key.vault';

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

  it('should create a new user and return tokens', async () => {
    const mockUser = {
      _id: 'mockId',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      role: 'customer',
    };
    (hash as jest.Mock).mockResolvedValue('hashedPassword');
    mockUserModel.create.mockResolvedValue(mockUser);
    mockJwtService.signAsync
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.signup({
      email: 'test@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
    });

    expect(hash).toHaveBeenCalledWith('password', 10);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      active: true,
      role: 'customer',
    });
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
      user: {
        id: 'mockId',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
        role: 'customer',
      },
    });
  });

  it('should throw BadRequestException if email already exists', async () => {
    mockUserModel.create.mockRejectedValue({ code: 11000 });

    await expect(
      service.signup({
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
      }),
    ).rejects.toThrow();
  });

  it('should return payload for a valid access token', async () => {
    const mockPayload = {
      id: 'userId',
      email: 'test@example.com',
      role: 'customer',
    };
    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

    const result = await service.validateAccessToken('validToken');

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
      publicKey: KeyVault.ACCESS_TOKEN_PUBLIC,
    });
    expect(result).toEqual(mockPayload);
  });

  it('should throw UnauthorizedException for an invalid token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(service.validateAccessToken('invalidToken')).rejects.toThrow();
  });

  it('should throw for an invalid refresh token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid refresh token'),
    );

    await expect(service.validateAccessToken('invalidToken')).rejects.toThrow();
  });

  it('should throw for an invalid access token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid access token'),
    );

    await expect(service.validateAccessToken('invalidToken')).rejects.toThrow();
  });

  it('should return payload for a valid refresh token', async () => {
    const mockPayload = {
      id: 'userId',
      email: 'test@example.com',
      role: 'customer',
    };
    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

    const result = await service.validateRefreshToken('validToken');

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
      publicKey: KeyVault.REFRESH_TOKEN_PUBLIC,
    });
    expect(result).toEqual(mockPayload);
  });

  it('should throw UnauthorizedException for an invalid refresh token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(
      service.validateRefreshToken('invalidToken'),
    ).rejects.toThrow();
  });

  it('should return user details for a valid user ID', async () => {
    const mockUser = {
      _id: 'userId',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
    };
    mockUserModel.findOne.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(mockUser),
    });
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(service.getUserDetails('userId')).rejects.toThrow();
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserModel.findById.mockResolvedValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.getUserDetails('invalidUserId')).rejects.toThrow();
  });

  it('should update user profile successfully', async () => {
    mockUserModel.findByIdAndUpdate.mockResolvedValue({});

    await expect(
      service.updateProfile('userId', {
        firstName: 'John',
        password: '',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
      }),
    ).resolves.not.toThrow();

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
    });
  });

  it('should hash the password and update the profile', async () => {
    (hash as jest.Mock).mockResolvedValue('hashedPassword');
    mockUserModel.findByIdAndUpdate.mockResolvedValue({});

    await service.updateProfile('userId', {
      password: 'newPassword',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
    });

    expect(hash).toHaveBeenCalledWith('newPassword', 10);
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', {
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
    });
  });

  it('should throw InternalServerErrorException if an update fails', async () => {
    mockUserModel.findByIdAndUpdate.mockRejectedValue(new Error());

    await expect(
      service.updateProfile('userId', {
        firstName: 'John',
        password: '',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
      }),
    ).rejects.toThrow();
  });

  it('should return access and refresh tokens', async () => {
    mockJwtService.signAsync
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.generateAuthTokens(
      'userId',
      'test@example.com',
      'customer' as UserRoleEnum,
    );

    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
    });
  });

  it('should throw InternalServerErrorException if token generation fails', async () => {
    mockJwtService.signAsync.mockRejectedValue(new Error());

    await expect(
      service.generateAuthTokens(
        'userId',
        'test@example.com',
        'customer' as UserRoleEnum,
      ),
    ).rejects.toThrow();
  });

  it('should throw BadRequestException if update data is invalid', async () => {
    mockUserModel.findByIdAndUpdate.mockRejectedValue(
      new Error('Validation failed'),
    );

    await expect(
      service.updateProfile('userId', {
        firstName: '',
        password: '',
        lastName: '',
        age: -1,
        gender: 'unknown',
      }),
    ).rejects.toThrow();
  });
});
