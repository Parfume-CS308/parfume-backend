import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Perfume, PerfumeSchema } from 'src/entities/perfume.entity';
import { Cart, CartSchema } from 'src/entities/cart.entity';
import { AuthModule } from 'src/auth/auth.module';

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
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
