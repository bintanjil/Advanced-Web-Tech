import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Product, product => product.discounts)
  products: Product[];

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ default: 0 })
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;
}
