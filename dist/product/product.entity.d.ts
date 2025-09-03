import { Seller } from '../seller/seller.entity';
import { OrderItem } from '../order/order-item.entity';
import { Category } from '../category/category.entity';
import { Review } from '../review/review.entity';
import { Discount } from '../discount/discount.entity';
export declare class Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    fileName?: string;
    discount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    seller: Seller;
    category: Category;
    reviews: Review[];
    discounts: Discount[];
    orderItems: OrderItem[];
}
