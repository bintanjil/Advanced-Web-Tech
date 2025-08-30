import { IsEnum, IsBoolean, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from './order.types';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: OrderStatus;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
