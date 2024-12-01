import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';

describe('CartService', () => {
  let service: CartService;

  // Mock MongoDB models
  const mockCartModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
  };

  const mockPerfumeModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken('Cart'), // Replace 'Cart' with your actual model name
          useValue: mockCartModel,
        },
        {
          provide: getModelToken('Perfume'), // Replace 'Perfume' with your actual model name
          useValue: mockPerfumeModel,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});