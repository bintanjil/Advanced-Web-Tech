import { OrderStatus } from './order.types';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    isPaid?: boolean;
    transactionId?: string;
}
