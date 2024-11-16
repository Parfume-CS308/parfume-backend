import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ReviewIdDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the review',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid review id',
  })
  reviewId: string;
}
