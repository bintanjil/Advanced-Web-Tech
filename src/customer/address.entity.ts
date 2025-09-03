import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Customer } from './customer.entity';

@Entity()
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    street: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    zipCode: string;

    @Column()
    country: string;

    @Column({ default: false })
    isDefault: boolean;

    @ManyToOne(() => Customer, (customer: Customer) => customer.addresses, { onDelete: 'CASCADE' })
    customer: Customer;
}