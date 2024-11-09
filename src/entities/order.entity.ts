import { Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/enums/entity.enums';

export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  user: User;

  @Prop([
    {
      perfume: { type: Types.ObjectId, ref: 'perfumes' },
      volume: Number,
      quantity: Number,
      price: Number,
      totalPrice: Number,
    },
  ])
  items: Array<{
    perfume: Perfume;
    volume: number;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: [Types.ObjectId], ref: 'campaigns' })
  appliedCampaigns?: Campaign[];

  @Prop({ default: 0 })
  campaignDiscountAmount: number;

  @Prop({
    required: true,
    enum: [
      OrderStatusEnum.PROCESSING,
      OrderStatusEnum.IN_TRANSIT,
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.REFUNDED,
    ],
    default: OrderStatusEnum.PROCESSING,
  })
  status: OrderStatusEnum;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({
    required: true,
    enum: [
      OrderPaymentStatusEnum.PENDING,
      OrderPaymentStatusEnum.COMPLETED,
      OrderPaymentStatusEnum.FAILED,
      OrderPaymentStatusEnum.REFUNDED,
    ],
    default: OrderPaymentStatusEnum.PENDING,
  })
  paymentStatus: OrderPaymentStatusEnum;

  @Prop({
    required: true,
  })
  paymentId: string; // would be a uuid

  @Prop({
    required: true,
  })
  invoiceNumber: string; // would be a short id, e.g., INV-1234

  @Prop({
    required: true,
  })
  invoiceUrl: string; // URL to stored PDF invoice
}
