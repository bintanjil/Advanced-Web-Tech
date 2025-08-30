import { Seller } from '../seller/seller.entity';
import { OrderItem } from 'src/order/order-item.entity';
export declare class Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    fileName?: string;
    discount: number;
    seller: Seller;
    orderItems: OrderItem[];
}
