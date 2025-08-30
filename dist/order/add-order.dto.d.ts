export declare class OrderItemDto {
    productId: number;
    quantity: number;
}
export declare class AddOrderDto {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: string;
    items: OrderItemDto[];
}
