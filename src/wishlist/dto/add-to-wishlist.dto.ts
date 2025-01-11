import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ description: 'Perfume ID to add to wishlist' })
  @IsMongoId({ message: 'Invalid perfume ID' })
  perfumeId: string;
}
