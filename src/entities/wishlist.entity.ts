import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';
import { User } from './user.entity';

@Schema({
  timestamps: true,
  collection: 'wishlists',
})
export class Wishlist extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop([{ type: Types.ObjectId, ref: Perfume.name }])
  perfumes: Perfume[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
