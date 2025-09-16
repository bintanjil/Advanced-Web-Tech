import { AddCustomerDto } from "./dto/add-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { AddAddressDto } from "./dto/add-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { Repository } from "typeorm";
import { Customer } from "./customer.entity";
import { Address } from "./address.entity";
export declare class CustomerService {
    private readonly customerRepository;
    private readonly addressRepository;
    private readonly salt;
    constructor(customerRepository: Repository<Customer>, addressRepository: Repository<Address>);
    findAll(): Promise<Customer[]>;
    getCustomerById(id: string): Promise<Customer>;
    findByUsername(username: string): Promise<Customer>;
    findByEmail(email: string): Promise<Customer | null>;
    findByFullNameSubstring(substring: string): Promise<Customer[]>;
    removeCustomer(id: string): Promise<boolean>;
    usernameExists(username: string): Promise<boolean>;
    emailExists(email: string): Promise<boolean>;
    createCustomer(addCustomerDto: AddCustomerDto): Promise<Customer>;
    updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    updateProfileImage(id: string, fileName: string): Promise<Customer>;
    addAddress(customerId: string, addAddressDto: AddAddressDto): Promise<Address>;
    updateAddress(customerId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<Address>;
    removeAddress(customerId: string, addressId: string): Promise<boolean>;
}
