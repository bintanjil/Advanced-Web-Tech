import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod } from './order.types';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, customer => customer.orders, { nullable: true })
  customer: Customer;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  shippingAddress: string;

  @Column()
  phoneNumber: string;

  @Column({ 
    type: 'enum',
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    default: 'credit_card'
  })
  paymentMethod: PaymentMethod;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  transactionId: string;
}