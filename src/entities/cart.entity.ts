import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'carts',
})
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: User;

  @Prop([
    {
      perfume: { type: Types.ObjectId, ref: 'perfumes' },
      volume: Number,
      quantity: Number,
    },
  ])
  items: Array<{
    perfume: Perfume;
    volume: number;
    quantity: number;
  }>;
}
