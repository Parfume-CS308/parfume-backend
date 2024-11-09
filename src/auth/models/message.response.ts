// response/login.response.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'Action is successful',
  })
  message: string;
}
