import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { AddCustomerDto } from "./dto/add-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { AddAddressDto } from "./dto/add-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Customer } from "./customer.entity";
import { Address } from "./address.entity";
@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>
    ) {}

    // Retrieve all customers
    async findAll(): Promise<Customer[]> {
        return await this.customerRepository.find({
            relations: ['addresses']
        });
    }

    // Retrieve customer by ID 
    async getCustomerById(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['addresses']
        });
        
        if (!customer) {
            throw new NotFoundException("Customer not found");
        }
        return customer;
    }

    // Retrieve customer by username
    async findByUsername(username: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { username },
            relations: ['addresses']
        });
        
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
            },
            relations: ['addresses']
        });
    }

    // Remove customer by ID
    async removeCustomer(id: string): Promise<boolean> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['addresses']
        });

        if (!customer) {
            return false;
        }

        await this.customerRepository.remove(customer);
        return true;
    }

    // Check if username already exists
    async usernameExists(username: string): Promise<boolean> {
        const existingCustomer = await this.customerRepository.findOne({
            where: { username }
        });
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

    // Update customer
    async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id }
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID '${id}' not found`);
        }

        // If username is being updated, check if it already exists
        if (updateCustomerDto.username && updateCustomerDto.username !== customer.username) {
            const usernameExists = await this.usernameExists(updateCustomerDto.username);
            if (usernameExists) {
                throw new ConflictException(`Username '${updateCustomerDto.username}' already exists`);
            }
        }

        Object.assign(customer, updateCustomerDto);
        return await this.customerRepository.save(customer);
    }

    // Update customer's profile image
    async updateProfileImage(id: string, fileName: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id }
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        customer.fileName = fileName;
        return await this.customerRepository.save(customer);
    }

    // Add a new address for a customer
    async addAddress(customerId: string, addAddressDto: AddAddressDto): Promise<Address> {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
            relations: ['addresses']
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const address = this.addressRepository.create({
            ...addAddressDto,
            customer
        });

        return await this.addressRepository.save(address);
    }

    // Update an address
    async updateAddress(
        customerId: string,
        addressId: string,
        updateAddressDto: UpdateAddressDto
    ): Promise<Address> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, customer: { id: customerId } },
            relations: ['customer']
        });

        if (!address) {
            throw new NotFoundException(`Address with ID '${addressId}' not found for customer '${customerId}'`);
        }

        Object.assign(address, updateAddressDto);
        return await this.addressRepository.save(address);
    }
    // Remove an address
    async removeAddress(customerId: string, addressId: string): Promise<boolean> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, customer: { id: customerId } }
        });

        if (!address) {
            return false;
        }

        await this.addressRepository.remove(address);
        return true;
    }
    
}