import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.entity';
import { Distributor } from './distributor.entity';

@Schema({
  timestamps: true,
  collection: 'perfumes',
})
export class Perfume extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop()
  notes: string[];

  @Prop({ required: true })
  type: string; // edp/edt/parfum esans

  @Prop({ required: true })
  assetUrl: string;

  @Prop()
  season: string;

  @Prop()
  sillage: string;

  @Prop()
  longevity: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Number, required: true })
  serialNumber: number;

  @Prop({
    type: Number,
    required: true,
    default: 12,
  })
  warrantyStatus: boolean; // 12 months by default

  @Prop({ type: Types.ObjectId, ref: 'distributors' })
  distributor: Distributor;

  @Prop([{ type: Types.ObjectId, ref: 'categories' }])
  categories: Category[];

  @Prop([
    {
      volume: { type: Number, required: true }, // mL (e.g., 50, 100, 150)
      basePrice: { type: Number, required: true }, // Parfumun maaliyeti, karlilik orani bunun ve price arasindaki farktan hesaplanacak, $ (e.g., 30, 50, 70)
      price: { type: Number, required: true }, // $ (e.g., 50, 100, 150)
      stock: { type: Number, required: true }, // number of items in stock
      active: { type: Boolean, default: true }, // is this variant active?
    },
  ])
  variants: Array<{
    volume: number;
    basePrice: number;
    price: number;
    stock: number;
    active: boolean;
  }>;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  numberOfRatings: number;

  @Prop({ default: 0 })
  totalSales: number;
}

export const PerfumeSchema = SchemaFactory.createForClass(Perfume);
