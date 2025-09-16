import { IsEmail, IsOptional, MinLength, Matches, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateCustomerDto{
    @IsOptional()
    @Matches(/^[A-Za-z0-9_]+$/, {message: "Username must contain only letters, numbers, and underscores"})
    username?: string;

    @IsOptional()
    @Matches(/^[A-za-z\s]+$/, {message: "Full name must contain only letters and spaces"})
    fullName?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(6)
    @Matches(/^(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter' })
    password?: string;

    @IsOptional()
    @Matches(/^(male|female)$/i, { message: 'Gender must be either male or female' })
    gender?: string;

    @IsOptional()
    @Matches(/^\d+$/, { message: 'Invalid phone number' })
    phone?: string;

    @IsOptional()
    fileName?: string;
}