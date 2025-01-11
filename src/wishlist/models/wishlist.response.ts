import { ApiProperty } from '@nestjs/swagger';
import { PerfumeTypeEnum } from 'src/enums/entity.enums';
import { AllPerfumeItemDto } from 'src/perfume/models/all_perfumes.response';

export class WishlistResponse {
  @ApiProperty({ example: 'Successfully fetched wishlist items' })
  message: string;

  @ApiProperty({
    type: [AllPerfumeItemDto],
    description: 'All perfumes in the system',
    example: [
      {
        id: '507f1f77bcf86cd799439011',
        name: 'Midnight Rose',
        brand: 'Chanel',
        notes: ['rose', 'oud', 'vanilla'],
        type: PerfumeTypeEnum.EDP,
        assetUrl: 'https://example.com/images/midnight-rose.jpg',
        season: 'Winter',
        sillage: 'Strong',
        longevity: 'Long-lasting',
        gender: 'Women',
        description: 'A sophisticated blend of rose and oriental notes',
        serialNumber: 123456,
        warrantyStatus: 1,
        distributor: {
          name: 'Luxury Perfumes Inc.',
          contactPerson: 'John Doe',
          email: 'john.doe@luxuryperfumes.com',
          phone: '+1 (555) 123-4567',
          address: '123 Luxury Boulevard, Beverly Hills, CA 90210',
        },
        categories: [
          {
            id: '507f1f77bcf86cd799439012',
            name: 'Oriental',
            description: 'Rich and exotic oriental fragrances',
          },
        ],
        variants: [
          {
            volume: 50,
            basePrice: 199.99,
            price: 149.99,
            stock: 50,
          },
          {
            volume: 100,
            basePrice: 299.99,
            price: 249.99,
            stock: 30,
          },
        ],
      },
    ],
  })
  items: AllPerfumeItemDto[];
}

export class ClearWishlistResponse {
  @ApiProperty({ example: 'Successfully cleared wishlist' })
  message: string;
}
