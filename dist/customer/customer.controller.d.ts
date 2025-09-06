import { CustomerService } from "./customer.service";
import { AddCustomerDto } from "./dto/add-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { AddAddressDto } from "./dto/add-address.dto";
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    getAllCustomers(): Promise<import("./customer.entity").Customer[]>;
    getProfile(req: any): Promise<import("./customer.entity").Customer>;
    getCustomerById(id: string, req: any): Promise<import("./customer.entity").Customer>;
    searchCustomers(query: string): Promise<import("./customer.entity").Customer[]>;
    removeCustomer(id: string, req: any): Promise<{
        message: string;
    }>;
    create(addCustomerDto: AddCustomerDto): Promise<{
        message: string;
        customer: import("./customer.entity").Customer;
    }>;
    uploadProfileImage(file: Express.Multer.File, req: any): Promise<{
        message: string;
        fileName: string;
    }>;
    updateProfile(updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
        message: string;
        customer: import("./customer.entity").Customer;
    }>;
    addAddress(addAddressDto: AddAddressDto, req: any): Promise<{
        message: string;
        address: import("./address.entity").Address;
    }>;
    updateAddress(addressId: string, updateAddressDto: UpdateAddressDto, req: any): Promise<{
        message: string;
        address: import("./address.entity").Address;
    }>;
    removeAddress(addressId: string, req: any): Promise<{
        message: string;
    }>;
}
