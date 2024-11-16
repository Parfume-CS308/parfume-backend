import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../entities/category.entity';
import { CategoryInformation } from './interfaces/category-types';
import { CreateCategoryDto } from './dto/create_category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly CategoryModel: Model<Category>,
  ) {}

  async getAllCategories(): Promise<CategoryInformation[]> {
    const allCategories = await this.CategoryModel.find(
      {},
      { _id: 1, name: 1, description: 1 },
    );
    const parsedCategories: CategoryInformation[] = allCategories.map(
      (category: Category) => ({
        id: (category._id as Types.ObjectId).toHexString(),
        name: category.name,
        description: category.description,
      }),
    );
    return parsedCategories;
  }

  async checkIfCategoryWithSameNameExists(
    name: string,
  ): Promise<Types.ObjectId> {
    const category = await this.CategoryModel.findOne({ name }, { _id: 1 });
    if (!category) {
      return null;
    }
    return category._id as Types.ObjectId;
  }

  async createCategory(input: CreateCategoryDto): Promise<void> {
    const categoryExists = await this.checkIfCategoryWithSameNameExists(
      input.name,
    );
    if (categoryExists) {
      throw new BadRequestException(
        'Category with the same name already exists',
      );
    }
    const newCategory = new this.CategoryModel({
      name: input.name,
      description: input.description,
      active: input.active,
    });
    await newCategory.save();
  }

  async updateCategory(id: string, input: CreateCategoryDto): Promise<void> {
    const existedCategory = await this.checkIfCategoryWithSameNameExists(
      input.name,
    );
    if (existedCategory && existedCategory.toHexString() !== id) {
      throw new BadRequestException(
        'Category with the same name already exists',
      );
    }
    await this.CategoryModel.findByIdAndUpdate(id, {
      name: input.name,
      description: input.description,
      active: input.active,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.CategoryModel.findByIdAndDelete(id);
  }
}
