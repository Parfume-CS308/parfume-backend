import { ApiProperty } from '@nestjs/swagger';
import { CategoryInformation } from '../interfaces/category-types';

export class AllCategoriesResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'Successfullly fetched all categories',
  })
  message: string;

  @ApiProperty({
    description: 'All categories in the system, as a list of objects',
    example: [
      {
        id: '507f1f77bcf86cd799439011',
        name: 'Fresh',
        description: 'Fresh fragrances for the modern touch',
      },
      {
        id: '507f1f77bcf86cd799439012',
        name: 'Woody',
        description: 'Woody fragrances for the classical touch',
      },
    ],
  })
  items: CategoryInformation[];
}
