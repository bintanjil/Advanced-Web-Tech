import { IsEnum, IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
