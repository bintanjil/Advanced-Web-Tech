export declare class OrderItemDto {
    productId: number;
    quantity: number;
}
export declare class AddOrderDto {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
    items: OrderItemDto[];
    transactionId?: string;
}
