import { ApiProperty } from '@nestjs/swagger';

export class PerfumeRatingResponse {
  @ApiProperty({
    example: 4.5,
    description: 'Average rating of the perfume',
  })
  averageRating: number;

  @ApiProperty({
    example: 2,
    description: 'Number of ratings given to the perfume',
  })
  ratingCount: number;

  @ApiProperty({
    example: true,
    description: 'Is the current user rated the perfume',
  })
  isRated: boolean;

  @ApiProperty({
    example: 4,
    description:
      'Rating of the current user, if rated it is number, otherwise null',
  })
  userRating: number | null;
}
