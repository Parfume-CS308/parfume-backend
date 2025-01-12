import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { Types } from 'mongoose';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
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
});
