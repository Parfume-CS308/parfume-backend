import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'ratings',
})
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: Types.ObjectId, ref: Perfume.name })
  perfume: Perfume;

  @Prop({ required: true })
  rating: number;

  @Prop()
  createdAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
