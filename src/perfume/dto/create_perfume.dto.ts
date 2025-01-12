import { ApiProperty } from '@nestjs/swagger';
import { PerfumeTypeEnum } from '../../enums/entity.enums';
import {
  PerfumeDistributorDto,
  PerfumeCategoryDto,
} from '../models/all_perfumes.response';

export class CreatePerfumeVariantDto {
  @ApiProperty({
    example: 100,
    description: 'Volume of the perfume in milliliters',
  })
  volume: number;

  @ApiProperty({
    example: 149.99,
    description: 'Current price after any discounts',
  })
  price: number;

  @ApiProperty({
    example: 119.99,
    description: 'Base price',
  })
  basePrice: number;

  @ApiProperty({
    example: 50,
    description: 'Current stock quantity',
  })
  stock: number;
}

export class CreatePerfumeCategoryDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the category',
  })
  id: string;
}

export class CreatePerfumeDto {
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
    description: 'Image file of the perfume, in UUIDv4 format',
    example: '24b3e7b5-c3a4-47a4-8cb7-1bf771cf6bf8',
  })
  assetId: string; // This should be a file upload response, uuid

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
    type: [CreatePerfumeCategoryDto],
    description: 'Categories this perfume belongs to',
  })
  categories: CreatePerfumeCategoryDto[];

  @ApiProperty({
    type: [CreatePerfumeVariantDto],
    description: 'Available variants of this perfume',
  })
  variants: CreatePerfumeVariantDto[];
}
