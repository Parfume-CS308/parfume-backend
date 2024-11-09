import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'distributors',
})
export class Distributor extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributor);
