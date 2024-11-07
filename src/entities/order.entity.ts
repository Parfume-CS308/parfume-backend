import { Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';
import { User } from './user.entity';

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

  @Prop({
    enum: ['processing', 'in-transit', 'delivered'],
    default: 'processing',
  })
  status: string;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({ required: true })
  paymentStatus: string; // pending, completed, failed

  @Prop()
  paymentId: string;

  @Prop()
  invoiceNumber: string;

  @Prop()
  invoiceUrl: string; // URL to stored PDF invoice
}
