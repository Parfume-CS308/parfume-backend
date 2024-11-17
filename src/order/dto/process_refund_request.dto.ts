import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class ProcessRefundRequestDto {
  @ApiProperty({
    description: 'Reason for rejection (required only when rejecting)',
    example: 'Product shows signs of usage',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
