import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
  IsOptional,
  Matches,
  MaxLength,
  IsUUID,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    description: 'Perfume ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  perfumeId: string;

  @ApiProperty({
    description: 'Volume of the perfume in ml',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  volume: number;

  @ApiProperty({
    description: 'Quantity of the perfume',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address for the order',
    example: 'Apartment 5B, 123 Main Street, Istanbul, Turkey',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @ApiProperty({
    description: 'Tax ID for invoice (optional)',
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Tax ID must be 10-11 digits',
  })
  taxId?: string;

  @ApiProperty({
    description: 'Array of campaign IDs to apply to the order',
    type: [String],
    required: false,
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @ApiProperty({
    description: 'Payment ID from payment service',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  paymentId: string;
}
