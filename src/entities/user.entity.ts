// src/entities/user.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoleEnum } from 'src/enums/entity.enums';

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ default: true })
  active: boolean;

  @Prop([String])
  shippingAddresses: string[];

  @Prop()
  phoneNumber: string;

  @Prop({
    required: true,
    enum: [
      UserRoleEnum.CUSTOMER,
      UserRoleEnum.SALES_MANAGER,
      UserRoleEnum.PRODUCT_MANAGER,
    ],
  })
  role: UserRoleEnum;
}

export const UserSchema = SchemaFactory.createForClass(User);
