import { Address } from './address.entity';
import { Order } from '../order/order.entity';
export declare class Customer {
    id: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    fileName: string;
    addresses: Address[];
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
}
