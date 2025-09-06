import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';
import { AddOrderDto } from './dto/add-order.dto';
import { UpdateOrderDto } from './update-order.dto';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order.types';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

   async getCustomerOrders(customerId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { customer: { id: customerId } },
      relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateOrderStatus(orderId: number, sellerId: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller']
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check if the seller owns any products in this order
    const hasSellerProducts = order.orderItems.some(
      item => item.product.seller.id === sellerId
    );

    if (!hasSellerProducts) {
      throw new ForbiddenException('You can only update orders containing your products');
    }

    if (status === 'confirmed') {
      // Check if all products are available in sufficient quantity
      for (const item of order.orderItems) {
        const product = item.product;
        if (product.seller.id === sellerId && product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
      }

      // Reduce stock for seller's products
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

  async createOrder(addOrderDto: AddOrderDto, customerId?: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productIds = addOrderDto.items.map(item => item.productId);
      
      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productIds) },
        relations: ['seller'],
        lock: { mode: 'pessimistic_write' }
      });

      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
      }

      const order = new Order();
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
        const customer = await queryRunner.manager.findOne(Customer, { 
          where: { id: customerId } 
        });
        if (customer) {
          order.customer = customer;
        }
      }

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of addOrderDto.items) {
        const product = products.find(p => p.id === itemDto.productId);
        
        if (!product) continue;

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`
          );
        }

        // Calculate price with discount
        const unitPrice = product.price * (1 - (product.discount || 0) / 100);
        const orderItem = new OrderItem();
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
      const savedOrder = await queryRunner.manager.save(Order, order);
      
      for (const item of orderItems) {
        item.order = savedOrder;
        await queryRunner.manager.save(OrderItem, item);
      }

      await queryRunner.commitTransaction();
      
      return await this.getOrderById(savedOrder.id);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller', 'customer'],
      order: { createdAt: 'DESC' }
    });
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'orderItems.product.seller', 'customer']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['orderItems', 'orderItems.product'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Handle stock changes based on status update
      if (updateOrderDto.status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.orderItems) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.product.id }
          });
          if (product) {
            product.stock += item.quantity;
            await queryRunner.manager.save(product);
          }
        }
      } else if (order.status === 'cancelled' && updateOrderDto.status && updateOrderDto.status !== 'cancelled') {
        for (const item of order.orderItems) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.product.id }
          });
          if (product) {
            if (product.stock < item.quantity) {
              throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
            }
            product.stock -= item.quantity;
            await queryRunner.manager.save(product);
          }
        }
      }

      // Update order
      if (updateOrderDto.status) order.status = updateOrderDto.status;
      if (updateOrderDto.isPaid !== undefined) order.isPaid = updateOrderDto.isPaid;
      if (updateOrderDto.transactionId) order.transactionId = updateOrderDto.transactionId;

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return savedOrder;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }


  async getSellerOrders(sellerId: number): Promise<Order[]> {
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

  async cancelOrder(id: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['orderItems', 'orderItems.product'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === 'delivered') {
        throw new BadRequestException('Cannot cancel a delivered order');
      }

      // Restore product stock
      for (const item of order.orderItems) {
        const product = item.product;
        product.stock += item.quantity;
        await queryRunner.manager.save(product);
      }

      order.status = 'cancelled';
      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}