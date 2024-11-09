import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.entity';
import { Perfume } from './perfume.entity';

@Schema({
  timestamps: true,
  collection: 'campaigns',
})
export class Campaign extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  discountRate: number; // Percentage value (e.g., 15 for 15% discount)

  @Prop({ type: [Types.ObjectId], required: true, ref: 'perfumes' })
  products: [Perfume]; // List of products that this campaign can be applied to

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  createdBy: User; // Sales Manager who created the campaign

  @Prop({ default: 0 })
  usageCount: number; // How many times this campaign has been used

  @Prop({ default: -1 })
  maxUsageCount: number; // Optional limit on how many times the campaign can be used, -1 for unlimited
}
