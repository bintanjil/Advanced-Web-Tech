import { IsEmail, isNotEmpty, IsNotEmpty, IsOptional, Matches, MinLength, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class AddCustomerDto{
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9_]+$/, {message: "Username must contain only letters, numbers, and underscores"})
    username: string;

    @IsNotEmpty()
    @Matches(/^[A-za-z\s]+$/, {message: "Full name must contain only letters and spaces"})
    fullName: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;

    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[\w-.]+@aiub\.edu$/ , {message: "Email format must contain @aiub.edu"},)
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter' })
    password: string;

    @IsNotEmpty()
    @Matches(/^(male|female)$/i, { message: 'Gender must be either male or female' })
    gender: string;

    @IsNotEmpty()
    @Matches(/^\d+$/, { message: 'Invalid phone number' })
    phone: string;
    
    @IsOptional()
    fileName?: string;
}