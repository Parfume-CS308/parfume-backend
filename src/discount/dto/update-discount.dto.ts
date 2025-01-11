import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateDiscountDto {
    @ApiProperty({ example: 'Summer Sale 2024', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: ['507f1f77bcf86cd799439011'], required: false })
    @IsArray()
    @IsOptional()
    perfumeIds?: string[];

    @ApiProperty({ example: 20, description: 'Discount percentage (0-100)', required: false })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discountRate?: number;

    @ApiProperty({
        type: "number",
        example: 1736622842465,
        required: false
    })
    @IsNumber()
    @IsOptional()
    startDate?: number;

    @ApiProperty({
        type: "number",
        example: 1736622842465,
        required: false
    })
    @IsNumber()
    @IsOptional()
    endDate?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
} 