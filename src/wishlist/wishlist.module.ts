import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist, WishlistSchema } from '../entities/wishlist.entity';
import { PerfumeModule } from 'src/perfume/perfume.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
    ]),
    AuthModule,
    PerfumeModule,
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}
