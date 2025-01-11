import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateDiscountDto {
    @ApiProperty({ example: 'Summer Sale 2024' })
    @IsString()
    name: string;

    @ApiProperty({ example: ['507f1f77bcf86cd799439011'] })
    @IsArray()
    perfumeIds: string[];

    @ApiProperty({ example: 20, description: 'Discount percentage (0-100)' })
    @IsNumber()
    @Min(0)
    @Max(100)
    discountRate: number;

    @ApiProperty({
        type: "number",
        example: 1736622842465
    })
    @IsNumber()
    startDate: number;

    @ApiProperty({
        type: "number",
        example: 1736622842465
    })
    @IsNumber()
    endDate: number;
} 