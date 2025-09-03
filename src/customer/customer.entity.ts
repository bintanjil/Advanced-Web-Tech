import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Address } from './address.entity';
import { Order } from '../order/order.entity';
import { Review } from '../review/review.entity';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    fullName: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    fileName: string;

    @OneToMany(() => Address, (address: Address) => address.customer, { cascade: true })
    addresses: Address[];

    @OneToMany(() => Order, (order: Order) => order.customer)
    orders: Order[];

    @OneToMany(() => Review, (review: Review) => review.customer)
    reviews: Review[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}