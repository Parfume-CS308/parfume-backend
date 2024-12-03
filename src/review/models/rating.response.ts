import { ApiProperty } from '@nestjs/swagger'

export class PerfumeRatingResponse {
  @ApiProperty({
    example: 4.5,
    description: 'Average rating of the perfume'
  })
  averageRating: number

  @ApiProperty({
    example: 2,
    description: 'Number of ratings given to the perfume'
  })
  ratingCount: number

  @ApiProperty({
    example: true,
    description: 'Is the current user rated the perfume'
  })
  isRated: boolean

  @ApiProperty({
    example: 4,
    description: 'Rating of the current user, if rated it is number, otherwise null'
  })
  userRating: number | null

  @ApiProperty({
    example: {
      1: 2,
      2: 1,
      3: 0,
      4: 3,
      5: 1
    },
    description: 'Rating counts of the perfume scaled from 1 to 5'
  })
  ratingCounts: {
    [key: number]: number
  }
}
