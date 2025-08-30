import { Seller } from '../seller/seller.entity';
export declare class Admin {
    id: number;
    name: string;
    email: string;
    nid: string;
    age: number;
    status?: 'active' | 'inactive';
    fileName: string;
    password: string;
    phone: string;
    sellers: Seller[];
}
