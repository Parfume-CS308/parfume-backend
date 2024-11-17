import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';
import { OrderPaymentStatusEnum, OrderStatusEnum } from '../enums/entity.enums';

@Schema({
  timestamps: true,
  collection: 'orders',
})
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop([
    {
      perfume: { type: Types.ObjectId, ref: Perfume.name },
      volume: Number,
      quantity: Number,
      price: Number,
    },
  ])
  items: Array<{
    perfume: Perfume | Types.ObjectId;
    volume: number;
    quantity: number;
    price: number;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: [Types.ObjectId], ref: Campaign.name })
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
      OrderStatusEnum.CANCELED,
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

  @Prop()
  taxId: string | null;

  @Prop()
  paymentId: string; // would be a uuid

  @Prop()
  invoiceNumber: string; // would be a short id, e.g., INV-1234

  @Prop()
  invoiceUrl: string; // URL to stored PDF invoice

  @Prop()
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);