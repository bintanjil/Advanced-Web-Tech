import { IsString, IsNumber, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

export class AddOrderDto {
  @IsString()
  customerName: string;

  @IsString()
  customerEmail: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(['credit_card', 'paypal', 'cash_on_delivery'])
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  transactionId?: string;
}
