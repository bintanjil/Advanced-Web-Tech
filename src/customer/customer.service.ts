import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { AddCustomerDto } from "./add-customer.dto";
import { UpdateCustomerDto } from "./update-customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Customer } from "./customer.entity";

@Injectable()
export class CustomerService{
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>
    ) {}

    // Retrieve all customers
    async findAll(): Promise<Customer[]> {
        return await this.customerRepository.find();
    }

    // Retrieve customer by ID 
    async getCustomerById(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            throw new NotFoundException("Customer not found");
        }
        return customer;
    }

    // Retrieve customer by username
    async findByUsername(username: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { username } });
        if (!customer) {
            throw new NotFoundException(`Customer with username '${username}' not found`);
        }
        return customer;
    }

    // Retrieve customers by substring of their fullname
    async findByFullNameSubstring(substring: string): Promise<Customer[]> {
        return await this.customerRepository.find({
            where: {
                fullName: Like(`%${substring}%`)
            }
        });
    }

    // Remove customer - username
    async removeByUsername(username: string): Promise<string> {
        const customer = await this.customerRepository.findOne({ where: { username } });

        if (!customer) {
            return `Customer with username "${username}" does not exist.`;
        }

        await this.customerRepository.remove(customer);
        return `Customer with username was "${username}" removed successfully.`;
    }

    // Check if username already exists
    async usernameExists(username: string): Promise<boolean> {
        const existingCustomer = await this.customerRepository.findOne({ where: { username } });
        return !!existingCustomer;
    }

    // Add new customer
    async createCustomer(addCustomerDto: AddCustomerDto): Promise<Customer> {
        // Check if username already exists
        const usernameExists = await this.usernameExists(addCustomerDto.username);
        if (usernameExists) {
            throw new ConflictException(`Username '${addCustomerDto.username}' already exists`);
        }

        const customer = this.customerRepository.create(addCustomerDto);
        return await this.customerRepository.save(customer);
    }

}