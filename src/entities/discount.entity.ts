import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Perfume } from './perfume.entity';
import { User } from './user.entity'; // Assuming Sales Managers are also stored in the User collection.

@Schema({
  timestamps: true,
  collection: 'discounts',
})
export class Discount extends Document {
  @Prop({ required: true })
  name: string; // Name of the discount campaign.

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: User; // Sales Manager who created the discount.

  @Prop([{ type: Types.ObjectId, ref: Perfume.name, required: true }])
  perfumes: Perfume[]; // Perfumes that are part of the discount.

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  discountRate: number; // Discount rate in percentage (e.g., 10 for 10%).

  @Prop({ required: true })
  startDate: Date; // When the discount becomes active.

  @Prop({ required: true })
  endDate: Date; // When the discount expires.

  @Prop({ default: true })
  active: boolean; // Whether the discount is currently active.
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
