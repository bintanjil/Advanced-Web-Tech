import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';
export declare class Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    product: Product;
    customer: Customer;
    isVisible: boolean;
}
