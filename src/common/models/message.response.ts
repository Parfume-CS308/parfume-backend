import { ApiProperty } from '@nestjs/swagger';

export class MessageResponse {
  @ApiProperty({
    description: 'Status message',
    example: 'Successfully made the action',
  })
  message: string;
}
