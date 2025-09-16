import { IsString, IsEmail, MinLength, Matches, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class AddCustomerDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_]+$/, {message: "Username must contain only letters, numbers, and underscores"})
  username: string;

  @IsNotEmpty()
  @Matches(/^[A-za-z\s]+$/, {message: "Full name must contain only letters and spaces"})
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter' })
  password: string;

  @IsNotEmpty()
  @Matches(/^(male|female)$/i, { message: 'Gender must be either male or female' })
  gender: string;

  @IsNotEmpty()
  @Matches(/^01\d{9}$/, { message: 'Phone number must be 11 digits starting with 01' })
  phone: string;

  @IsOptional()
  @IsDateString({}, {
    message: 'Invalid date format for dateOfBirth'
  })
  dateOfBirth?: string;

  @IsOptional()
  fileName?: string;
}
