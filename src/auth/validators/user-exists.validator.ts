import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';

@ValidatorConstraint({ name: 'IsUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ email }).exec();
    if (!user) {
      // NOTE: User does not exist, good to go
      return true;
    }
    return false;
  }

  defaultMessage(): string {
    return 'The email is already registered, please try another one';
  }
}
