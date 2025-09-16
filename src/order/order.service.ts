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
import { Response } from 'express';
const PDFDocument = require('pdfkit');

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
      
      // First get products without lock to avoid LEFT JOIN + FOR UPDATE issue
      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productIds) },
        relations: ['seller']
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
      // First, find the order without pessimistic lock to avoid LEFT JOIN issues
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['orderItems', 'orderItems.product']
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === 'cancelled') {
        throw new BadRequestException('Order is already cancelled');
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

  async generateInvoice(order: Order, res: Response): Promise<void> {
    try {
      console.log('Starting invoice generation for order:', order.id);
      
      return new Promise<void>((resolve, reject) => {
        try {
          const doc = new PDFDocument();
          const filename = `invoice-${order.id}.pdf`;

          // Set response headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

          console.log('PDF headers set, starting document generation');

          // Pipe the PDF document to response
          doc.pipe(res);

          // Add company header
          doc.fontSize(20).text('E-Commerce Platform', 50, 50);
          doc.fontSize(12).text('Invoice', 50, 80);
          
          // Add invoice details
          doc.text(`Invoice #: INV-${order.id}`, 50, 110);
          doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 125);
          doc.text(`Status: ${order.status.toUpperCase()}`, 50, 140);

          // Customer information
          doc.text('Bill To:', 50, 170);
          doc.text(`${order.customerName || order.customer?.fullName || 'N/A'}`, 50, 185);
          doc.text(`${order.customerEmail || order.customer?.email || 'N/A'}`, 50, 200);
          doc.text(`${order.shippingAddress || 'N/A'}`, 50, 215);
          doc.text(`Phone: ${order.phoneNumber || 'N/A'}`, 50, 230);

          // Table headers
          const tableTop = 280;
          doc.text('Item', 50, tableTop);
          doc.text('Quantity', 200, tableTop);
          doc.text('Unit Price', 300, tableTop);
          doc.text('Total', 400, tableTop);

          // Draw line under headers
          doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();

          // Add order items
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
          } else {
            doc.text('No items found', 50, yPosition);
          }

          // Add totals
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

          // Add payment information
          yPosition += 40;
          doc.fontSize(12).text(`Payment Method: ${order.paymentMethod?.toUpperCase().replace('_', ' ') || 'N/A'}`, 50, yPosition);
          doc.text(`Payment Status: ${order.isPaid ? 'PAID' : 'UNPAID'}`, 50, yPosition + 15);

          // Add footer
          yPosition += 60;
          doc.text('Thank you for your business!', 50, yPosition);
          doc.text('For any queries, contact us at support@ecommerce.com', 50, yPosition + 20);

          console.log('PDF content added, finalizing document');

          // Finalize the PDF and end the stream
          doc.end();

          doc.on('end', () => {
            console.log('PDF generation completed successfully');
            resolve();
          });

          doc.on('error', (err) => {
            console.error('PDF generation error:', err);
            reject(err);
          });
          
        } catch (error) {
          console.error('Error in PDF creation block:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in generateInvoice method:', error);
      throw error;
    }
  }
}