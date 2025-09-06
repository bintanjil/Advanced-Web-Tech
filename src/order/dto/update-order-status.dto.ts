import { IsIn } from 'class-validator';
import { OrderStatus } from '../order.types';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status: OrderStatus;
}
