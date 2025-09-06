import { Product } from '../product/product.entity';
export declare class Category {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    products: Product[];
}
