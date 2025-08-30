// src/customer/customer.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { Customer } from './customer.entity';
import { Address } from './address.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, Address]),
        forwardRef(() => OrderModule),
    ],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [TypeOrmModule, CustomerService], // Export TypeOrmModule and CustomerService
})
export class CustomerModule {}