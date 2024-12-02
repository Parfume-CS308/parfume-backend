import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 'This is a great perfume!',
    description: 'Comment of the review',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
