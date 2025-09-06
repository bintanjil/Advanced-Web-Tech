import { Product } from '../product/product.entity';
export declare class Discount {
    id: number;
    name: string;
    description: string;
    percentage: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    products: Product[];
    terms: string;
    usageLimit: number;
    usageCount: number;
}
