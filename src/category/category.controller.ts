import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Res,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CategoryService } from './category.service';
import { AllCategoriesResponse } from './models/all_categories.response';

@Controller('categories')
@ApiTags('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all perfume categories',
    description:
      'Get all categories for homepage all perfume display and filtering',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all categories',
    type: AllCategoriesResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getAllCategories(
    @Res() res: Response,
  ): Promise<Response<AllCategoriesResponse>> {
    try {
      Logger.log(
        'Fetching all categories',
        'CategoryController.getAllCategories',
      );
      const categories = await this.categoryService.getAllCategories();
      Logger.log(
        `Successfully fetched all categories of count: ${categories.length}`,
        'CategoryController.getAllCategories',
      );
      return res.json({
        message: 'Successfully fetched all categories',
        items: categories,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }
}
