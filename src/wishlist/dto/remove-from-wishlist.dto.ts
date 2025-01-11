import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveFromWishlistDto {
  @ApiProperty({ description: 'Perfume ID to remove from wishlist' })
  @IsMongoId({ message: 'Invalid perfume ID' })
  perfumeId: string;
}
