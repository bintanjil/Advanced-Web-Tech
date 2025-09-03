// src/product/product.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Seller } from '../seller/seller.entity';
import { OrderItem } from '../order/order-item.entity';
import { Category } from '../category/category.entity';
import { Review } from '../review/review.entity';
import { Discount } from '../discount/discount.entity';

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

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Seller, seller => seller.products, { 
    onDelete: 'CASCADE', 
    nullable: false 
  })
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @ManyToMany(() => Discount)
  @JoinTable({
    name: 'product_discounts',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'discountId', referencedColumnName: 'id' }
  })
  discounts: Discount[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}