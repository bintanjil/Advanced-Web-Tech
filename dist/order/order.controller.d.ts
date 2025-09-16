import { Response } from 'express';
import { OrderService } from './order.service';
import { AddOrderDto } from './dto/add-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    updateOrderStatus(orderId: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<import("./order.entity").Order>;
    createOrder(addOrderDto: AddOrderDto, req: any): Promise<import("./order.entity").Order>;
    getCustomerOrders(req: any): Promise<import("./order.entity").Order[]>;
    getOrders(req: any): Promise<import("./order.entity").Order[]>;
    getOrderById(id: number, req: any): Promise<import("./order.entity").Order>;
    updateOrder(id: number, updateOrderDto: UpdateOrderDto, req: any): Promise<import("./order.entity").Order>;
    cancelOrder(id: number, req: any): Promise<import("./order.entity").Order>;
    deleteOrder(id: number): Promise<import("./order.entity").Order>;
    downloadInvoice(id: number, req: any, res: Response): Promise<void>;
}
