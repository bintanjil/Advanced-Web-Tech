import { Customer } from './customer.entity';
export declare class Address {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: string;
    additionalInfo: string;
    customer: Customer;
}
