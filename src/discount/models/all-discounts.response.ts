import { ApiProperty } from '@nestjs/swagger';
import { DiscountDto } from './discount.response';

export class AllDiscountsResponse {
    @ApiProperty({ example: 'Successfully fetched all discounts' })
    message: string;

    @ApiProperty({ type: [DiscountDto] })
    items: DiscountDto[];
} 