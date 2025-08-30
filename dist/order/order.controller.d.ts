import { OrderService } from './order.service';
import { AddOrderDto } from './dto/add-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(addOrderDto: AddOrderDto, req: any): Promise<import("./order.entity").Order>;
    getOrders(req: any): Promise<import("./order.entity").Order[]>;
    getOrderById(id: number, req: any): Promise<import("./order.entity").Order>;
    updateOrder(id: number, updateOrderDto: UpdateOrderDto, req: any): Promise<import("./order.entity").Order>;
    cancelOrder(id: number, req: any): Promise<import("./order.entity").Order>;
    deleteOrder(id: number): Promise<import("./order.entity").Order>;
}
