import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from '../../common/models/message.response';

export class CartItemDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the perfume',
  })
  perfumeId: string;

  @ApiProperty({
    example: 'Midnight Rose',
    description: 'Name of the perfume',
  })
  perfumeName: string;

  @ApiProperty({
    example: 'Chanel',
    description: 'Brand of the perfume',
  })
  brand: string;

  @ApiProperty({
    example: 100,
    description: 'Volume of the perfume in milliliters',
  })
  volume: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the perfume in the cart',
  })
  quantity: number;
}

export class CartDetailDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the shopping cart',
  })
  id: string;

  @ApiProperty({
    type: [CartItemDto],
    description: 'List of items in the shopping cart',
  })
  items: CartItemDto[];
}

export class CartDetailsResponse extends MessageResponse {
  @ApiProperty({
    type: CartDetailDto,
    description: 'Details of the shopping cart',
  })
  cart: CartDetailDto;
}
