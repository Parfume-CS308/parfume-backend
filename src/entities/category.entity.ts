import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'categories',
})
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: 'perfumes',
  })
  perfumes: [Perfume];
}
