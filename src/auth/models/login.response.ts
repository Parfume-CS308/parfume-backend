import { ApiProperty } from '@nestjs/swagger';
import { UserBasicInfo } from '../interfaces/auth-types';

export class LoginResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'male',
      role: 'customer',
    },
  })
  user: UserBasicInfo;
}
