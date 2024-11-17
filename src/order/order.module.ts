import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Category, CategorySchema } from 'src/entities/category.entity';
import { Order, OrderSchema } from 'src/entities/order.entity';
import { Perfume, PerfumeSchema } from 'src/entities/perfume.entity';
import { Cart, CartSchema } from 'src/entities/cart.entity';
import { RefundRequest, RefundRequestSchema } from 'src/entities/refund_request.entity';
import { Campaign, CampaignSchema } from 'src/entities/campaign.entity';
import { CartModule } from 'src/cart/cart.module';

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
        name: Campaign.name,
        schema: CampaignSchema,
      }
    ]),
    CartModule,
    AuthModule,
  ],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
