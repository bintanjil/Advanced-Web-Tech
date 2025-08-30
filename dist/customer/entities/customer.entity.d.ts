import { Address } from './address.entity';
import { Gender } from '../types/gender.type';
export declare class Customer {
    id: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    gender: Gender;
    fileName: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    addresses: Address[];
}
