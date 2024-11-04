// src/dto/signup.dto.ts
import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  Validate,
  IsEmail,
} from 'class-validator';
import { IsUserAlreadyExist } from '../validators/user-exists.validator';
import { genderRegex, passwordRegex } from '../../constants/regex';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(passwordRegex, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character, and must be at least 8 characters long',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @IsString()
  @IsNotEmpty()
  @Matches(genderRegex, {
    message: 'Gender must be either male, female, or other',
  })
  gender: string;
}
