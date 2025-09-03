// src/order/add-order.dto.ts
import { IsEmail, IsNotEmpty, IsNumber, IsPositive, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddOrderDto {
  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsNotEmpty()
  shippingAddress: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}