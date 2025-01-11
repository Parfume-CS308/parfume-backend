import { ApiProperty } from '@nestjs/swagger';

export class DiscountPerfumeDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    brand: string;

    @ApiProperty()
    originalPrice: number;

    @ApiProperty()
    discountedPrice: number;
}

export class DiscountDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    discountRate: number;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiProperty()
    active: boolean;

    @ApiProperty({ type: [DiscountPerfumeDto] })
    perfumes: DiscountPerfumeDto[];

    @ApiProperty()
    createdBy: string;
}

export class DiscountResponse {
    @ApiProperty({ example: 'Successfully created discount' })
    message: string;

    @ApiProperty({ type: DiscountDto })
    item: DiscountDto;
}

export class AllDiscountsResponse {
    @ApiProperty({ example: 'Successfully fetched all discounts' })
    message: string;

    @ApiProperty({ type: [DiscountDto] })
    items: DiscountDto[];
} 