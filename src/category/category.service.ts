import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from 'src/entities/category.entity';
import { CategoryInformation } from './interfaces/category-types';

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
}
