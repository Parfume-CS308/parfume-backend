import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'reviews',
})
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'users' })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'perfumes' })
  perfume: Perfume;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop()
  approvedAt: Date;
}
