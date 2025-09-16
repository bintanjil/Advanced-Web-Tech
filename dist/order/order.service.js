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
const PDFDocument = require('pdfkit');
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
    async getCustomerOrders(customerId) {
        return await this.orderRepository.find({
            where: { customer: { id: customerId } },
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller'],
            order: { createdAt: 'DESC' }
        });
    }
    async updateOrderStatus(orderId, sellerId, status) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller']
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const hasSellerProducts = order.orderItems.some(item => item.product.seller.id === sellerId);
        if (!hasSellerProducts) {
            throw new common_1.ForbiddenException('You can only update orders containing your products');
        }
        if (status === 'confirmed') {
            for (const item of order.orderItems) {
                const product = item.product;
                if (product.seller.id === sellerId && product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
                }
            }
            for (const item of order.orderItems) {
                if (item.product.seller.id === sellerId) {
                    const product = item.product;
                    product.stock -= item.quantity;
                    await this.productRepository.save(product);
                }
            }
        }
        order.status = status;
        return this.orderRepository.save(order);
    }
    async createOrder(addOrderDto, customerId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const productIds = addOrderDto.items.map(item => item.productId);
            const products = await queryRunner.manager.find(product_entity_1.Product, {
                where: { id: (0, typeorm_2.In)(productIds) },
                relations: ['seller']
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
                relations: ['orderItems', 'orderItems.product']
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status === 'cancelled') {
                throw new common_1.BadRequestException('Order is already cancelled');
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
    async generateInvoice(order, res) {
        try {
            console.log('Starting invoice generation for order:', order.id);
            return new Promise((resolve, reject) => {
                try {
                    const doc = new PDFDocument();
                    const filename = `invoice-${order.id}.pdf`;
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    console.log('PDF headers set, starting document generation');
                    doc.pipe(res);
                    doc.fontSize(20).text('E-Commerce Platform', 50, 50);
                    doc.fontSize(12).text('Invoice', 50, 80);
                    doc.text(`Invoice #: INV-${order.id}`, 50, 110);
                    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 125);
                    doc.text(`Status: ${order.status.toUpperCase()}`, 50, 140);
                    doc.text('Bill To:', 50, 170);
                    doc.text(`${order.customerName || order.customer?.fullName || 'N/A'}`, 50, 185);
                    doc.text(`${order.customerEmail || order.customer?.email || 'N/A'}`, 50, 200);
                    doc.text(`${order.shippingAddress || 'N/A'}`, 50, 215);
                    doc.text(`Phone: ${order.phoneNumber || 'N/A'}`, 50, 230);
                    const tableTop = 280;
                    doc.text('Item', 50, tableTop);
                    doc.text('Quantity', 200, tableTop);
                    doc.text('Unit Price', 300, tableTop);
                    doc.text('Total', 400, tableTop);
                    doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
                    let yPosition = tableTop + 30;
                    let subtotal = 0;
                    console.log('Adding order items to PDF, order items count:', order.orderItems?.length || 0);
                    if (order.orderItems && order.orderItems.length > 0) {
                        order.orderItems.forEach((item) => {
                            const unitPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
                            const itemTotal = unitPrice * item.quantity;
                            subtotal += itemTotal;
                            doc.text(item.product?.name || 'Unknown Product', 50, yPosition);
                            doc.text(item.quantity.toString(), 200, yPosition);
                            doc.text(`৳${unitPrice.toFixed(2)}`, 300, yPosition);
                            doc.text(`৳${itemTotal.toFixed(2)}`, 400, yPosition);
                            yPosition += 20;
                        });
                    }
                    else {
                        doc.text('No items found', 50, yPosition);
                    }
                    yPosition += 20;
                    doc.moveTo(300, yPosition).lineTo(500, yPosition).stroke();
                    yPosition += 15;
                    doc.text('Subtotal:', 300, yPosition);
                    doc.text(`৳${subtotal.toFixed(2)}`, 400, yPosition);
                    yPosition += 20;
                    doc.text('Shipping:', 300, yPosition);
                    doc.text('৳0.00', 400, yPosition);
                    yPosition += 20;
                    doc.text('Tax:', 300, yPosition);
                    doc.text('৳0.00', 400, yPosition);
                    yPosition += 20;
                    doc.fontSize(14).text('Total:', 300, yPosition);
                    const totalAmount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
                    doc.text(`৳${totalAmount.toFixed(2)}`, 400, yPosition);
                    yPosition += 40;
                    doc.fontSize(12).text(`Payment Method: ${order.paymentMethod?.toUpperCase().replace('_', ' ') || 'N/A'}`, 50, yPosition);
                    doc.text(`Payment Status: ${order.isPaid ? 'PAID' : 'UNPAID'}`, 50, yPosition + 15);
                    yPosition += 60;
                    doc.text('Thank you for your business!', 50, yPosition);
                    doc.text('For any queries, contact us at support@ecommerce.com', 50, yPosition + 20);
                    console.log('PDF content added, finalizing document');
                    doc.end();
                    doc.on('end', () => {
                        console.log('PDF generation completed successfully');
                        resolve();
                    });
                    doc.on('error', (err) => {
                        console.error('PDF generation error:', err);
                        reject(err);
                    });
                }
                catch (error) {
                    console.error('Error in PDF creation block:', error);
                    reject(error);
                }
            });
        }
        catch (error) {
            console.error('Error in generateInvoice method:', error);
            throw error;
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