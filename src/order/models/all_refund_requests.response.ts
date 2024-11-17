import { ApiProperty } from '@nestjs/swagger';
import { RefundRequestStatusEnum } from 'src/entities/refund_request.entity';

export class RefundRequestItem {
  @ApiProperty()
  perfumeId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  volume: number;

  @ApiProperty()
  refundAmount: number;
}

export class RefundRequestResponse {
  @ApiProperty()
  refundRequestId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [RefundRequestItem] })
  items: RefundRequestItem[];

  @ApiProperty()
  totalRefundAmount: number;

  @ApiProperty({ enum: RefundRequestStatusEnum })
  status: RefundRequestStatusEnum;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  processedAt?: Date;
}

export class AllRefundRequestsResponse {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: [RefundRequestResponse] })
  items: RefundRequestResponse[];
}