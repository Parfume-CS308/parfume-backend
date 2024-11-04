// validators/user-exists.validator.ts
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';

@ValidatorConstraint({ name: 'IsUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    if (!email) return false;
    try {
      const user = await this.userModel.findOne({ email }).lean();
      return !user; // returns true if user doesn't exist (valid), false if exists (invalid)
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with email "${args.value}" already exists`;
  }
}
