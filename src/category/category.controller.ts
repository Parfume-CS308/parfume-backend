import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CategoryService } from './category.service';
import { AllCategoriesResponse } from './models/all_categories.response';
import { MessageResponse } from 'src/common/models/message.response';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ObjectIdDto } from 'src/common/dto/object_id.dto';
import { CreateCategoryDto } from './dto/create_category.dto';

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

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Create a new category with a name',
  })
  @ApiOkResponse({
    description: 'Successfully created a new category',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async createCategory(
    @Res() res: Response,
    @Body() input: CreateCategoryDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Creating a new category with name: ${input.name}`,
        'CategoryController.createCategory',
      );
      await this.categoryService.createCategory(input);
      Logger.log(
        `Successfully created a new category with name: ${input.name}`,
        'CategoryController.createCategory',
      );
      return res.json({
        message: 'Category created successfully',
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Post(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Update a category',
    description: 'Update a category by its id',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category id to update',
  })
  @ApiOkResponse({
    description: 'Successfully updated category',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async updateCategory(
    @Res() res: Response,
    @Param() params: ObjectIdDto,
    @Body() input: CreateCategoryDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Updating category with id: ${params.id}`,
        'CategoryController.updateCategory',
      );
      await this.categoryService.updateCategory(params.id, input);
      Logger.log(
        `Successfully updated category with id: ${params.id}`,
        'CategoryController.updateCategory',
      );
      return res.json({
        message: 'Category updated successfully',
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Delete a category by its id',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category id to delete',
  })
  @ApiOkResponse({
    description: 'Successfully deleted category',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async deleteCategory(
    @Res() res: Response,
    @Param() params: ObjectIdDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Deleting category with id: ${params.id}`,
        'CategoryController.deleteCategory',
      );
      await this.categoryService.deleteCategory(params.id);
      Logger.log(
        `Successfully deleted category with id: ${params.id}`,
        'CategoryController.deleteCategory',
      );
      return res.json({
        message: 'Category deleted successfully',
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
