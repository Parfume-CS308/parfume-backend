import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Response } from 'express';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { AuthTokenPayload } from '../auth/interfaces/auth-types';
import { UserRoleEnum } from '../enums/entity.enums';
import { SyncCartDto } from './dto/sync_cart.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';


jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
jest.spyOn(Logger, 'log').mockImplementation(() => undefined);

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCartService = {
    getCartDetails: jest.fn(),
    syncCart: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockUser: AuthTokenPayload = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: UserRoleEnum.CUSTOMER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  describe('getCartDetails', () => {
    const mockCartItems = [
      {
        perfume: '507f1f77bcf86cd799439011',
        volume: 100,
        quantity: 2,
      },
    ];

    it('should successfully fetch cart details', async () => {
      mockCartService.getCartDetails.mockResolvedValue(mockCartItems);

      await controller.getCartDetails(mockResponse, mockUser);

      expect(cartService.getCartDetails).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully fetched all items in the shopping cart',
        items: mockCartItems,
      });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      mockCartService.getCartDetails.mockRejectedValue(new Error('Database error'));

      await expect(controller.getCartDetails(mockResponse, mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(Logger.error).not.toHaveBeenCalled();
    });
  });

  describe('syncCart', () => {
    const mockSyncCartDto: SyncCartDto = {
      items: [
        {
          perfume: '507f1f77bcf86cd799439011',
          volume: 100,
          quantity: 2,
        },
      ],
    };

    const mockSyncResponse = [
      {
        perfume: '507f1f77bcf86cd799439011',
        volume: 100,
        quantity: 2,
      },
    ];

    it('should successfully sync cart', async () => {
      mockCartService.syncCart.mockResolvedValue(mockSyncResponse);

      await controller.syncCart(mockResponse, mockUser, mockSyncCartDto);

      expect(cartService.syncCart).toHaveBeenCalledWith(mockUser.id, mockSyncCartDto.items);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully synced the shopping cart',
        items: mockSyncResponse,
      });
    });

    it('should throw BadRequestException when invalid data is provided', async () => {
      const invalidSyncCartDto: SyncCartDto = {
        items: [
          {
            perfume: 'invalid-id',
            volume: 100,
            quantity: 2,
          },
        ],
      };

      mockCartService.syncCart.mockRejectedValue(new BadRequestException('Invalid perfume id'));

      await expect(
        controller.syncCart(mockResponse, mockUser, invalidSyncCartDto),
      ).rejects.toThrow(BadRequestException);
      expect(Logger.error).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      const error = new Error('Database error');
      mockCartService.syncCart.mockRejectedValue(error);

      await expect(
        controller.syncCart(mockResponse, mockUser, mockSyncCartDto),
      ).rejects.toThrow(InternalServerErrorException);
      
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to sync the shopping cart',
        error.stack,
        'CartController.syncCart',
      );
    });

    it('should validate cart item quantity is positive', async () => {
      const invalidQuantityDto: SyncCartDto = {
        items: [
          {
            perfume: '507f1f77bcf86cd799439011',
            volume: 100,
            quantity: -1,
          },
        ],
      };

      mockCartService.syncCart.mockRejectedValue(new BadRequestException('Invalid quantity'));

      await expect(
        controller.syncCart(mockResponse, mockUser, invalidQuantityDto),
      ).rejects.toThrow(BadRequestException);
      expect(Logger.error).not.toHaveBeenCalled();
    });

    it('should validate cart item volume is positive', async () => {
      const invalidVolumeDto: SyncCartDto = {
        items: [
          {
            perfume: '507f1f77bcf86cd799439011',
            volume: 0,
            quantity: 1,
          },
        ],
      };

      mockCartService.syncCart.mockRejectedValue(new BadRequestException('Invalid volume'));

      await expect(
        controller.syncCart(mockResponse, mockUser, invalidVolumeDto),
      ).rejects.toThrow(BadRequestException);
      expect(Logger.error).not.toHaveBeenCalled();
    });

    it('should handle empty cart sync', async () => {
      const emptyCartDto: SyncCartDto = {
        items: [],
      };

      mockCartService.syncCart.mockResolvedValue([]);

      await controller.syncCart(mockResponse, mockUser, emptyCartDto);

      expect(cartService.syncCart).toHaveBeenCalledWith(mockUser.id, []);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully synced the shopping cart',
        items: [],
      });
    });
  });
});