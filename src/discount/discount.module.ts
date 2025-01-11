import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { Discount, DiscountSchema } from '../entities/discount.entity';
import { PerfumeModule } from '../perfume/perfume.module';
import { WishlistModule } from '../wishlist/wishlist.module';
import { Wishlist } from 'src/entities/wishlist.entity';
import { WishlistSchema } from 'src/entities/wishlist.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discount.name, schema: DiscountSchema },
      { name: Wishlist.name, schema: WishlistSchema },
    ]),
    AuthModule,
    forwardRef(() => PerfumeModule),
    forwardRef(() => WishlistModule),
  ],
  controllers: [DiscountController],
  providers: [DiscountService],
  exports: [DiscountService],
})
export class DiscountModule { }
