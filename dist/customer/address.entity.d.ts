import { Customer } from './customer.entity';
export declare class Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    customer: Customer;
}
