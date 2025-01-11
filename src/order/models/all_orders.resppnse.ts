import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from '../../common/models/message.response';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from '../../enums/entity.enums';
export class OrdersPerfumeVariantItem {
  @ApiProperty({
    description: 'Perfume ID',
    example: '507f1f77bcf86cd799439011',
  })
  perfumeId: string;

  @ApiProperty({
    description: 'Volume of the perfume',
    example: 100,
  })
  volume: number;

  @ApiProperty({
    description: 'Quantity of the perfume',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Price of the perfume',
    example: 100,
  })
  price: number;

  @ApiProperty({
    description: 'Total price of the perfume',
    example: 200,
  })
  totalPrice: number;
}

export class OrdersDiscountItem {
  @ApiProperty({
    description: 'Discount ID',
    example: '507f1f77bcf86cd799439011',
  })
  discountId: string;

  @ApiProperty({
    description: 'Name of the discount',
    example: 'Summer Sale',
  })
  name: string;

  @ApiProperty({
    description: 'Discount percent of the discount',
    example: 10,
  })
  discountPercent: number;
}

export class AllOrdersItem {
  @ApiProperty({
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  orderId: string;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Items in the order',
    example: [
      {
        perfumeId: '507f1f77bcf86cd799439011',
        volume: 100,
        quantity: 2,
        price: 100,
        totalPrice: 200,
      },
      {
        perfumeId: '507f1f77bcf86cd799439012',
        volume: 100,
        quantity: 2,
        price: 100,
        totalPrice: 200,
      },
    ],
  })
  items: OrdersPerfumeVariantItem[];

  @ApiProperty({
    description: 'Total amount of the order',
    example: 400,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Applied discounts on the order',
    example: [
      {
        discountId: '507f1f77bcf86cd799439011',
        name: 'Summer Sale',
        discountPercent: 10,
      },
    ],
  })
  appliedDiscounts: OrdersDiscountItem[];

  @ApiProperty({
    description: 'Discount discount amount of the order',
    example: 40,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Status of the order',
    example: 'PROCESSING',
  })
  status: OrderStatusEnum;

  @ApiProperty({
    description: 'Shipping address of the order',
    example: 'Istanbul, Turkey',
  })
  shippingAddress: string;

  @ApiProperty({
    description: 'Payment status of the order',
    example: 'PENDING',
  })
  paymentStatus: OrderPaymentStatusEnum;

  @ApiProperty({
    description: 'Tax ID of the order',
    example: 'b5e7e7b0-7b1b-11eb-9439-0242ac130002',
  })
  taxId: string;

  @ApiProperty({
    description: 'Payment ID of the order',
    example: 'b5e7e7b0-7b1b-11eb-9439-0242ac130002',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Invoice ID of the order',
    example: 'INV-1234',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Invoice PDF URL of the order',
    example: 'https://example.com/invoice.pdf',
  })
  invoiceUrl: string;

  @ApiProperty({
    description: 'Created at date of the order',
    example: 1612137600000,
  })
  createdAt: number;

  @ApiProperty({
    description: 'Last four digits of the card',
    example: '4242',
  })
  cardLastFourDigits: string;
}

export class AllOrdersResponse extends MessageResponse {
  @ApiProperty({
    description: 'All orders in the system, as a list of objects',
    example: [
      {
        orderId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            perfumeId: '507f1f77bcf86cd799439011',
            volume: 100,
            quantity: 2,
            price: 100,
            totalPrice: 200,
          },
          {
            perfumeId: '507f1f77bcf86cd799439012',
            volume: 100,
            quantity: 2,
            price: 100,
            totalPrice: 200,
          },
        ],
        totalAmount: 400,
        appliedDiscounts: [
          {
            discountId: '507f1f77bcf86cd799439011',
            name: 'Summer Sale',
            discountPercent: 10,
          },
        ],
        discountAmount: 40,
        status: 'PROCESSING',
        shippingAddress: 'Istanbul, Turkey',
        paymentStatus: 'PENDING',
        paymentId: 'b5e7e7b0-7b1b-11eb-9439-0242ac130002',
        invoiceNumber: 'INV-1234',
        invoiceUrl: 'https://example.com/invoice.pdf',
        createdAt: 1612137600000,
        cardLastFourDigits: '4242',
      },
      {
        orderId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439012',
        items: [
          {
            perfumeId: '507f1f77bcf86cd799439011',
            volume: 100,
            quantity: 2,
            price: 100,
            totalPrice: 200,
          },
          {
            perfumeId: '507f1f77bcf86cd799439012',
            volume: 100,
            quantity: 2,
            price: 100,
            totalPrice: 200,
          },
        ],
        totalAmount: 400,
        appliedDiscounts: [
          {
            discountId: '507f1f77bcf86cd799439011',
            name: 'Summer Sale',
            discountPercent: 10,
          },
        ],
        discountAmount: 40,
        status: 'PROCESSING',
        shippingAddress: 'Istanbul, Turkey',
        paymentStatus: 'PENDING',
        paymentId: 'b5e7e7b0-7b1b-11eb-9439-0242ac130002',
        invoiceNumber: 'INV-1234',
        invoiceUrl: 'https://example.com/invoice.pdf',
        createdAt: 1612137600000,
        cardLastFourDigits: '4242',
      },
    ],
  })
  items: AllOrdersItem[];
}
