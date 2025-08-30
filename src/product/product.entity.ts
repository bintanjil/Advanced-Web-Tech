// src/product/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Seller } from '../seller/seller.entity';
import { OrderItem } from 'src/order/order-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', unsigned: true })
  stock: number;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @ManyToOne(() => Seller, seller => seller.products, { 
    onDelete: 'CASCADE', 
    nullable: false 
  })
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.product)
  orderItems: OrderItem[];
}