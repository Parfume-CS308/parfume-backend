// src/dto/signup.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  ValidateIf,
} from 'class-validator';
import { genderRegex, passwordRegex } from '../../constants/regex';

export class UpdateProfileDto {
  @ApiProperty({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, number, and special char)',
    example: 'Test1234!',
    required: true,
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @ValidateIf((_, value) => value !== '')
  @Matches(passwordRegex, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'User age',
    example: 25,
    required: true,
    minimum: 13,
    maximum: 120,
  })
  @IsInt({ message: 'Age must be a number' })
  @Min(13, { message: 'You must be at least 13 years old' })
  @Max(120, { message: 'Age cannot exceed 120 years' })
  age: number;

  @ApiProperty({
    description: 'User gender',
    example: 'male',
    required: true,
    enum: ['male', 'female', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  @Matches(genderRegex, {
    message: 'Gender must be either male, female, or other',
  })
  gender: string;
}
