import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  Matches,
  MaxLength,
  IsUUID,
  IsCreditCard,
  ValidateIf,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: 'Apartment 5B, 123 Main Street, Istanbul, Turkey',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @ApiProperty({
    description: 'Tax ID for invoice (optional)',
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.taxId)
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Tax ID must be 10-11 digits',
  })
  taxId?: string;

  @ApiProperty({
    description: 'Payment ID from payment service',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  paymentId: string;

  @ApiProperty({
    description: 'Credit card number for the order',
    example: '4242424242424242',
    maxLength: 16,
  })
  @IsString()
  @IsCreditCard()
  cardNumber: string;

  @ApiProperty({
    description: 'Credit card holder name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  cardHolder: string;

  @ApiProperty({
    description: 'Credit card expiration month',
    example: '12',
    maxLength: 2,
  })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'Expiration month must be between 01-12',
  })
  expiryDateMM: string;

  @ApiProperty({
    description: 'Credit card expiration year',
    example: '2023',
    maxLength: 4,
  })
  @IsString()
  @Matches(/^[0-9]{4}$/, {
    message: 'Expiration year must be 4 digits',
  })
  expiryDateYY: string;

  @ApiProperty({
    description: 'Credit card CVV',
    example: '123',
    maxLength: 3,
  })
  @IsString()
  @Matches(/^[0-9]{3}$/, {
    message: 'CVV must be 3 digits',
  })
  cvv: string;
}
