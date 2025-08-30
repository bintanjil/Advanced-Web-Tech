export declare class UpdateOrderDto {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    isPaid?: boolean;
    transactionId?: string;
}
