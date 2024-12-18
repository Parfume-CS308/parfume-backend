import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { OrderStatusEnum } from 'src/enums/entity.enums';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid OrderId',
  })
  orderId: string;

  @ApiProperty({
    description: 'New status for the order',
    enum: ['processing', 'in-transit', 'delivered', 'refunded', 'canceled'],
    example: 'processing',
  })
  @IsString()
  @Matches(/^(processing|in-transit|delivered|refunded|canceled)$/)
  status: OrderStatusEnum;
}
