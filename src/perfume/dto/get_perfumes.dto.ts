// dto/get-perfumes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { PerfumeTypeEnum } from 'src/enums/entity.enums';

export enum PerfumeSortingEnum {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BEST_SELLER = 'best_seller',
  RATING = 'rating',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class PerfumeFilterDto {
  @ApiProperty({
    required: false,
    isArray: true,
    example: [],
    description: 'Array of category IDs to filter perfumes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    required: false,
    minimum: 0,
    example: 50,
    description: 'Minimum price filter for perfumes',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf((_, value) => value !== -1)
  minPrice?: number = -1;

  @ApiProperty({
    required: false,
    minimum: 0,
    example: 200,
    description: 'Maximum price filter for perfumes',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf((_, value) => value !== -1)
  maxPrice?: number = -1;

  @ApiProperty({
    required: false,
    isArray: true,
    example: ['LuxeParfums'],
    description: 'Array of brands to filter perfumes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    enum: ['male', 'female', 'unisex'],
    example: ['women', 'men', 'unisex'],
    description: 'Array of genders to filter perfumes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genders?: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    enum: PerfumeTypeEnum,
    enumName: 'PerfumeTypeEnum',
    example: ['edp', 'edt', 'parfum'],
    description: 'Type of perfume (EDP/EDT/Parfum)',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PerfumeTypeEnum, {each: true})
  type?: PerfumeTypeEnum[];

  @ApiProperty({
    required: false,
    enum: PerfumeSortingEnum,
    enumName: 'PerfumeSortingEnum',
    default: PerfumeSortingEnum.BEST_SELLER,
    example: 'price_asc',
    description:
      'Sorting option for perfumes (price_asc, price_desc, best_seller, rating, name_asc, name_desc, newest, oldest)',
  })
  @IsOptional()
  @IsEnum(PerfumeSortingEnum)
  sortBy?: PerfumeSortingEnum = PerfumeSortingEnum.BEST_SELLER;
}
