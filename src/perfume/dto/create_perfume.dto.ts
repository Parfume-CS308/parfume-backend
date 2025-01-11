import { ApiProperty } from '@nestjs/swagger';
import { PerfumeTypeEnum } from '../../enums/entity.enums';
import {
  PerfumeVariantDto,
  PerfumeDistributorDto,
  PerfumeCategoryDto,
} from '../models/all_perfumes.response';

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
