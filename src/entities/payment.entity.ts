import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Order } from './order.entity';

@Schema({
  timestamps: true,
  collection: 'payments',
})
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'orders' })
  order: Order;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: User;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: 'pending' | 'completed' | 'failed';

  @Prop()
  transactionId: string;

  @Prop()
  paymentMethod: string;
}
