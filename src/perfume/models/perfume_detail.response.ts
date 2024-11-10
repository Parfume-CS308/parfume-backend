import { ApiProperty } from '@nestjs/swagger';
import { PerfumeTypeEnum } from '../../enums/entity.enums';
import {
  PerfumeCategoryDto,
  PerfumeDistributorDto,
  PerfumeVariantDto,
} from './all_perfumes.response';

export class PerfumeDetailDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the perfume',
  })
  id: string;

  @ApiProperty({
    example: 'Midnight Rose',
    description: 'Name of the perfume',
  })
  name: string;

  @ApiProperty({
    example: 'Chanel',
    description: 'Brand of the perfume',
  })
  brand: string;

  @ApiProperty({
    example: ['rose', 'oud', 'vanilla'],
    description: 'Array of fragrance notes',
  })
  notes: string[];

  @ApiProperty({
    enum: PerfumeTypeEnum,
    example: PerfumeTypeEnum.EDP,
    description: 'Type of the perfume (EDP, EDT, etc.)',
  })
  type: PerfumeTypeEnum;

  @ApiProperty({
    example: 'https://example.com/images/midnight-rose.jpg',
    description: 'URL of the perfume image',
  })
  assetUrl: string;

  @ApiProperty({
    example: 'Winter',
    description: 'Recommended season for the perfume',
  })
  season: string;

  @ApiProperty({
    example: 'Strong',
    description: 'Sillage (projection) of the perfume',
  })
  sillage: string;

  @ApiProperty({
    example: 'Long-lasting',
    description: 'Longevity of the perfume',
  })
  longevity: string;

  @ApiProperty({
    example: 'Women',
    description: 'Target gender for the perfume',
  })
  gender: string;

  @ApiProperty({
    example: 'A sophisticated blend of rose and oriental notes',
    description: 'Detailed description of the perfume',
  })
  description: string;

  @ApiProperty({
    example: 123456,
    description: 'Serial number of the perfume',
  })
  serialNumber: number;

  @ApiProperty({
    example: 1,
    description: 'Warranty status (1: active, 0: inactive)',
  })
  warrantyStatus: number;

  @ApiProperty({
    type: PerfumeDistributorDto,
    description: 'Distributor information',
  })
  distributor: PerfumeDistributorDto;

  @ApiProperty({
    type: [PerfumeCategoryDto],
    description: 'Categories this perfume belongs to',
  })
  categories: PerfumeCategoryDto[];

  @ApiProperty({
    type: [PerfumeVariantDto],
    description: 'Available variants of this perfume',
  })
  variants: PerfumeVariantDto[];
}

export class PerfumeDetailResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'Successfully fetched the perfume details',
  })
  message: string;

  @ApiProperty({
    type: [PerfumeDetailDto],
    description: 'All perfumes in the system',
    example: {
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
  })
  items: PerfumeDetailDto[];
}
