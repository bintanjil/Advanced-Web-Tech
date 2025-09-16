import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { AddCustomerDto } from "./dto/add-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { AddAddressDto } from "./dto/add-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Customer } from "./customer.entity";
import { Address } from "./address.entity";
import * as bcrypt from 'bcrypt';
@Injectable()
export class CustomerService {
    private readonly salt = 10;
    
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>
    ) {}

    // Retrieve all customers
    async findAll(): Promise<Customer[]> {
        return await this.customerRepository.find({
            relations: ['addresses', 'orders', 'reviews']
        });
    }

    // Retrieve customer by ID 
    async getCustomerById(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['addresses', 'orders', 'orders.orderItems', 'orders.orderItems.product', 'reviews']
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
            relations: ['addresses', 'orders', 'reviews']
        });
        
        if (!customer) {
            throw new NotFoundException(`Customer with username '${username}' not found`);
        }
        return customer;
    }

    // Retrieve customer by email
    async findByEmail(email: string): Promise<Customer | null> {
        const customer = await this.customerRepository.findOne({
            where: { email }
        });
        
        return customer; // Don't throw error here as auth service needs to check null
    }

    // Retrieve customers by substring of their fullname
    async findByFullNameSubstring(substring: string): Promise<Customer[]> {
        return await this.customerRepository.find({
            where: {
                fullName: Like(`%${substring}%`)
            },
            relations: ['addresses', 'orders', 'reviews']
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

    // Check if email already exists
    async emailExists(email: string): Promise<boolean> {
        const existingCustomer = await this.customerRepository.findOne({
            where: { email }
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

        // Check if email already exists
        const emailExists = await this.emailExists(addCustomerDto.email);
        if (emailExists) {
            throw new ConflictException(`Email '${addCustomerDto.email}' already exists`);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(addCustomerDto.password, this.salt);

        // Create customer with proper field mapping
        const customer = this.customerRepository.create({
            username: addCustomerDto.username,
            fullName: addCustomerDto.fullName,
            email: addCustomerDto.email,
            password: hashedPassword,
            gender: addCustomerDto.gender,
            phoneNumber: addCustomerDto.phone, // Map phone to phoneNumber
            dateOfBirth: addCustomerDto.dateOfBirth ? new Date(addCustomerDto.dateOfBirth) : undefined,
            fileName: addCustomerDto.fileName
        });
        
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

        // Map phone to phoneNumber and handle other updates
        const updateData = { ...updateCustomerDto };
        if (updateData.phone) {
            customer.phoneNumber = updateData.phone;
            delete updateData.phone; // Remove phone so it doesn't conflict
        }

        // Handle dateOfBirth conversion
        if (updateData.dateOfBirth) {
            customer.dateOfBirth = new Date(updateData.dateOfBirth);
            delete updateData.dateOfBirth; // Remove dateOfBirth so it doesn't conflict
        } else if (updateData.dateOfBirth === null || updateData.dateOfBirth === '') {
            customer.dateOfBirth = undefined;
            delete updateData.dateOfBirth;
        }

        Object.assign(customer, updateData);
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