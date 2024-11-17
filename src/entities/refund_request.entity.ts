// refund-request.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum RefundRequestStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({
  timestamps: true,
  collection: 'refundrequests',
})
export class RefundRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: Order.name, required: true })
  order: Order;

  @Prop([
    {
      perfumeId: { type: Types.ObjectId },
      quantity: Number,
      volume: Number,
      refundAmount: Number,
    },
  ])
  items: Array<{
    perfumeId: Types.ObjectId;
    quantity: number;
    volume: number;
    refundAmount: number;
  }>;

  @Prop({ required: true })
  totalRefundAmount: number;

  @Prop({
    required: true,
    enum: [
      RefundRequestStatusEnum.PENDING,
      RefundRequestStatusEnum.APPROVED,
      RefundRequestStatusEnum.REJECTED,
    ],
    default: RefundRequestStatusEnum.PENDING,
  })
  status: RefundRequestStatusEnum;

  @Prop()
  rejectionReason?: string;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;
}

export const RefundRequestSchema = SchemaFactory.createForClass(RefundRequest);