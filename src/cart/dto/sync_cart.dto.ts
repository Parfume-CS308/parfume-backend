import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Min } from 'class-validator';

export class SyncCartItemDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the perfume',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid perfume id',
  })
  perfume: string;

  @ApiProperty({
    example: 100,
    description: 'Volume of the perfume in milliliters',
  })
  @Min(1)
  volume: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the perfume in the cart',
  })
  @Min(1)
  quantity: number;
}

export class SyncCartDto {
  @ApiProperty({
    type: [SyncCartItemDto],
    example: [
      {
        perfume: '507f1f77bcf86cd799439011',
        volume: 100,
        quantity: 2,
      },
    ],
    description: 'List of items in the shopping cart',
  })
  items: SyncCartItemDto[];
}
