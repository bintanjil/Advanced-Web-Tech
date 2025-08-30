import { Customer } from '../customer/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod } from './order.types';
export declare class Order {
    id: number;
    customer: Customer;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    orderItems: OrderItem[];
    isPaid: boolean;
    transactionId: string;
}
