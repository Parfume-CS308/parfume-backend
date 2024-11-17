import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class RefundItemDto {
  @ApiProperty({
    description: 'Perfume ID to be refunded',
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
    description: 'Quantity to refund',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateRefundRequestDto {
  @ApiProperty({
    description: 'Array of items to refund',
    type: [RefundItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items: RefundItemDto[];
}

export class RefundRequestIdDto {
  @ApiProperty({
    description: 'Refund request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/)
  refundRequestId: string;
}
