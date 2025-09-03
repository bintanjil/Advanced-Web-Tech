import { IsString, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';

export class AddCustomerDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(3)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak - must contain at least 1 uppercase, 1 lowercase, and 1 number or special character'
  })
  password: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @Matches(/^\+?[\d\s-]+$/, {
    message: 'Invalid phone number format'
  })
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
