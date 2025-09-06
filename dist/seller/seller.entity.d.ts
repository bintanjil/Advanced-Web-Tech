import { Admin } from '../admin/admin.entity';
import { Product } from '../product/product.entity';
export declare class Seller {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: number;
    nid: string;
    fileName?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
    admin: Admin;
    products: Product[];
}
