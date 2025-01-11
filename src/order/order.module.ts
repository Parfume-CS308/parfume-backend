import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from '../entities/category.entity';
import { Order, OrderSchema } from '../entities/order.entity';
import { Perfume, PerfumeSchema } from '../entities/perfume.entity';
import { Cart, CartSchema } from '../entities/cart.entity';
import {
  RefundRequest,
  RefundRequestSchema,
} from '../entities/refund_request.entity';
import { CartModule } from '../cart/cart.module';
import { User, UserSchema } from 'src/entities/user.entity';
import { DiscountModule } from 'src/discount/discount.module';
import { PerfumeModule } from 'src/perfume/perfume.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Perfume.name,
        schema: PerfumeSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: RefundRequest.name,
        schema: RefundRequestSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    CartModule,
    AuthModule,
    DiscountModule,
    PerfumeModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
