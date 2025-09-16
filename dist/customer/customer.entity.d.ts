import { Address } from './address.entity';
import { Order } from '../order/order.entity';
import { Review } from '../review/review.entity';
export declare class Customer {
    id: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth?: Date;
    gender: string;
    fileName: string;
    addresses: Address[];
    orders: Order[];
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}
