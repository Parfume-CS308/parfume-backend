import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Perfume, PerfumeSchema } from '../entities/perfume.entity';
import { Cart, CartSchema } from '../entities/cart.entity';
import { AuthModule } from '../auth/auth.module';
import { DiscountModule } from 'src/discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Perfume.name,
        schema: PerfumeSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
    ]),
    AuthModule,
    DiscountModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
