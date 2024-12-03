import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export class CreateRatingDto {
  @ApiProperty({
    example: 4,
    description: 'Rating of the review'
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number
}
