import { Types } from 'mongoose';

export interface ValidateUserInterface {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}
