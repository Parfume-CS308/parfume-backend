// response/signup.response.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserBasicInfo } from '../interfaces/auth-types';

export class SignUpResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'User registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'batuhanisildak@sabanciuniv.edu',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
    },
  })
  user: UserBasicInfo;
}
