import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AllReviewItemDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Unique identifier of the perfume',
  })
  id: string;

  @ApiProperty({
    example: 'YSL Myself',
    description: 'Name of the perfume',
  })
  perfumeName: string;

  @ApiProperty({
    example: 'Batuhan Isildak',
    description: 'Name of the user',
  })
  user: string;

  @ApiProperty({
    example: 'This is a great perfume!',
    description: 'Comment of the review',
  })
  comment: string;

  @ApiProperty({
    example: true,
    description: 'Approval status of the review',
  })
  isApproved: boolean;

  @ApiProperty({
    example: 1629000000000,
    description:
      'Date and time when the review was approved, in epoch milliseconds',
  })
  @IsOptional()
  approvedAt: number | null;

  @ApiProperty({
    example: 1629000000000,
    description:
      'Date and time when the review was created, in epoch milliseconds',
  })
  createdAt: number;
}

export class AllReviewsResponse {
  @ApiProperty({
    example: 'Successfully fetched all public reviews',
    description: 'Message indicating the success of the operation',
  })
  message: string;

  @ApiProperty({
    type: [AllReviewItemDto],
    description: 'Array of public reviews',
  })
  reviews: AllReviewItemDto[];
}
