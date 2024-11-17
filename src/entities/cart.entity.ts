import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'carts',
})
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop([
    {
      perfume: { type: Types.ObjectId, ref: Perfume.name },
      volume: Number,
      quantity: Number,
    },
  ])
  items: Array<{
    perfume: Types.ObjectId | Perfume;
    volume: number;
    quantity: number;
  }>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
