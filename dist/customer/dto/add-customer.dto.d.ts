import { Gender } from '../geneder.type';
export declare class AddCustomerDto {
    username: string;
    fullName: string;
    email: string;
    password: string;
    gender?: Gender;
    phone?: string;
    fileName?: string;
}
