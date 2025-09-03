"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const product_entity_1 = require("../product/product.entity");
const customer_entity_1 = require("../customer/customer.entity");
const order_item_entity_1 = require("./order-item.entity");
let OrderService = class OrderService {
    orderRepository;
    orderItemRepository;
    productRepository;
    customerRepository;
    dataSource;
    constructor(orderRepository, orderItemRepository, productRepository, customerRepository, dataSource) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }
    async createOrder(addOrderDto, customerId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const productIds = addOrderDto.items.map(item => item.productId);
            const products = await queryRunner.manager.find(product_entity_1.Product, {
                where: { id: (0, typeorm_2.In)(productIds) },
                relations: ['seller'],
                lock: { mode: 'pessimistic_write' }
            });
            if (products.length !== productIds.length) {
                const foundIds = products.map(p => p.id);
                const missingIds = productIds.filter(id => !foundIds.includes(id));
                throw new common_1.NotFoundException(`Products not found: ${missingIds.join(', ')}`);
            }
            const order = new order_entity_1.Order();
            order.customerName = addOrderDto.customerName;
            order.customerEmail = addOrderDto.customerEmail;
            order.shippingAddress = addOrderDto.shippingAddress;
            order.phoneNumber = addOrderDto.phoneNumber;
            order.paymentMethod = addOrderDto.paymentMethod;
            if (addOrderDto.transactionId) {
                order.transactionId = addOrderDto.transactionId;
            }
            order.status = 'pending';
            order.isPaid = order.paymentMethod === 'cash_on_delivery' ? false : true;
            if (customerId) {
                const customer = await queryRunner.manager.findOne(customer_entity_1.Customer, {
                    where: { id: customerId }
                });
                if (customer) {
                    order.customer = customer;
                }
            }
            let totalAmount = 0;
            const orderItems = [];
            for (const itemDto of addOrderDto.items) {
                const product = products.find(p => p.id === itemDto.productId);
                if (!product)
                    continue;
                if (product.stock < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`);
                }
                const unitPrice = product.price * (1 - (product.discount || 0) / 100);
                const orderItem = new order_item_entity_1.OrderItem();
                orderItem.product = product;
                orderItem.quantity = itemDto.quantity;
                orderItem.unitPrice = unitPrice;
                orderItem.totalPrice = unitPrice * itemDto.quantity;
                orderItems.push(orderItem);
                totalAmount += orderItem.totalPrice;
                product.stock -= itemDto.quantity;
                await queryRunner.manager.save(product);
            }
            order.totalAmount = totalAmount;
            const savedOrder = await queryRunner.manager.save(order_entity_1.Order, order);
            for (const item of orderItems) {
                item.order = savedOrder;
                await queryRunner.manager.save(order_item_entity_1.OrderItem, item);
            }
            await queryRunner.commitTransaction();
            return await this.getOrderById(savedOrder.id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllOrders() {
        return await this.orderRepository.find({
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller', 'customer'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller', 'customer']
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrder(id, updateOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                where: { id },
                relations: ['orderItems', 'orderItems.product'],
                lock: { mode: 'pessimistic_write' }
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (updateOrderDto.status === 'cancelled' && order.status !== 'cancelled') {
                for (const item of order.orderItems) {
                    const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                        where: { id: item.product.id }
                    });
                    if (product) {
                        product.stock += item.quantity;
                        await queryRunner.manager.save(product);
                    }
                }
            }
            else if (order.status === 'cancelled' && updateOrderDto.status && updateOrderDto.status !== 'cancelled') {
                for (const item of order.orderItems) {
                    const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                        where: { id: item.product.id }
                    });
                    if (product) {
                        if (product.stock < item.quantity) {
                            throw new common_1.BadRequestException(`Insufficient stock for product: ${product.name}`);
                        }
                        product.stock -= item.quantity;
                        await queryRunner.manager.save(product);
                    }
                }
            }
            if (updateOrderDto.status)
                order.status = updateOrderDto.status;
            if (updateOrderDto.isPaid !== undefined)
                order.isPaid = updateOrderDto.isPaid;
            if (updateOrderDto.transactionId)
                order.transactionId = updateOrderDto.transactionId;
            const savedOrder = await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
            return savedOrder;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getCustomerOrders(customerId) {
        return await this.orderRepository.find({
            where: { customer: { id: customerId } },
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller'],
            order: { createdAt: 'DESC' }
        });
    }
    async getSellerOrders(sellerId) {
        return await this.orderRepository.find({
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller', 'customer'],
            where: {
                orderItems: {
                    product: {
                        seller: { id: sellerId }
                    }
                }
            },
            order: { createdAt: 'DESC' }
        });
    }
    async cancelOrder(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                where: { id },
                relations: ['orderItems', 'orderItems.product'],
                lock: { mode: 'pessimistic_write' }
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status === 'delivered') {
                throw new common_1.BadRequestException('Cannot cancel a delivered order');
            }
            for (const item of order.orderItems) {
                const product = item.product;
                product.stock += item.quantity;
                await queryRunner.manager.save(product);
            }
            order.status = 'cancelled';
            const savedOrder = await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
            return savedOrder;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrderService);
//# sourceMappingURL=order.service.js.map