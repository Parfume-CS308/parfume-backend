import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { CreateCategoryDto } from './dto/create_category.dto';

jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
jest.spyOn(Logger, 'log').mockImplementation(() => undefined);

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    getAllCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockResponse = {
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  describe('getAllCategories', () => {
    const mockCategories = [
      { 
        id: '1', 
        name: 'Floral', 
        description: 'Fragrances with flower scents',
        active: true 
      },
      { 
        id: '2', 
        name: 'Woody', 
        description: 'Fragrances with wood scents',
        active: true 
      },
    ];

    it('should successfully fetch all categories', async () => {
      mockCategoryService.getAllCategories.mockResolvedValue(mockCategories);

      await controller.getAllCategories(mockResponse);

      expect(categoryService.getAllCategories).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully fetched all categories',
        items: mockCategories,
      });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      mockCategoryService.getAllCategories.mockRejectedValue(new Error('Database error'));

      await expect(controller.getAllCategories(mockResponse)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createCategory', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Floral',
      description: 'Fragrances for clean and fresh scents',
      active: true,
    };

    it('should successfully create a category', async () => {
      mockCategoryService.createCategory.mockResolvedValue(undefined);

      await controller.createCategory(mockResponse, createCategoryDto);

      expect(categoryService.createCategory).toHaveBeenCalledWith(createCategoryDto);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Category created successfully',
      });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      mockCategoryService.createCategory.mockRejectedValue(new Error('Database error'));

      await expect(controller.createCategory(mockResponse, createCategoryDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should validate category creation with all required fields', async () => {
      const completeCategory: CreateCategoryDto = {
        name: 'Fresh',
        description: 'Light and airy fragrances',
        active: true,
      };

      mockCategoryService.createCategory.mockResolvedValue(undefined);

      await controller.createCategory(mockResponse, completeCategory);

      expect(categoryService.createCategory).toHaveBeenCalledWith(completeCategory);
      expect(categoryService.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          active: expect.any(Boolean),
        }),
      );
    });
  });

  describe('updateCategory', () => {
    const categoryId = { id: '507f1f77bcf86cd799439011' };
    const updateCategoryDto: CreateCategoryDto = {
      name: 'Updated Floral',
      description: 'Updated description for floral fragrances',
      active: true,
    };

    it('should successfully update a category', async () => {
      mockCategoryService.updateCategory.mockResolvedValue(undefined);

      await controller.updateCategory(mockResponse, categoryId, updateCategoryDto);

      expect(categoryService.updateCategory).toHaveBeenCalledWith(categoryId.id, updateCategoryDto);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Category updated successfully',
      });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      mockCategoryService.updateCategory.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.updateCategory(mockResponse, categoryId, updateCategoryDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should validate category update with all required fields', async () => {
      const completeUpdate: CreateCategoryDto = {
        name: 'Updated Fresh',
        description: 'Updated description for fresh fragrances',
        active: false,
      };

      mockCategoryService.updateCategory.mockResolvedValue(undefined);

      await controller.updateCategory(mockResponse, categoryId, completeUpdate);

      expect(categoryService.updateCategory).toHaveBeenCalledWith(
        categoryId.id,
        expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          active: expect.any(Boolean),
        }),
      );
    });
  });

  describe('deleteCategory', () => {
    const categoryId = { id: '507f1f77bcf86cd799439011' };

    it('should successfully delete a category', async () => {
      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await controller.deleteCategory(mockResponse, categoryId);

      expect(categoryService.deleteCategory).toHaveBeenCalledWith(categoryId.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Category deleted successfully',
      });
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      mockCategoryService.deleteCategory.mockRejectedValue(new Error('Database error'));

      await expect(controller.deleteCategory(mockResponse, categoryId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});