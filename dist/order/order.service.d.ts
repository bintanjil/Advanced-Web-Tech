import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';
import { AddOrderDto } from './dto/add-order.dto';
import { UpdateOrderDto } from './update-order.dto';
import { OrderItem } from './order-item.entity';
export declare class OrderService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly productRepository;
    private readonly customerRepository;
    private dataSource;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, customerRepository: Repository<Customer>, dataSource: DataSource);
    createOrder(addOrderDto: AddOrderDto, customerId?: string): Promise<Order>;
    getAllOrders(): Promise<Order[]>;
    getOrderById(id: number): Promise<Order>;
    updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    getCustomerOrders(customerId: string): Promise<Order[]>;
    getSellerOrders(sellerId: number): Promise<Order[]>;
    cancelOrder(id: number): Promise<Order>;
}
