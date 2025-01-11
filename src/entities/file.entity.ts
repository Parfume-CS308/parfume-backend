import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'files',
})
export class File extends Document {
  @Prop({
    required: true,
    unique: true,
  })
  id: string;

  @Prop({
    required: true,
  })
  path: string;

  @Prop({
    required: true,
  })
  originalName: string;

  @Prop({
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  })
  mimetype: string;

  @Prop({
    required: true,
    min: 0,
  })
  size: number;
}

export const FileSchema = SchemaFactory.createForClass(File);
