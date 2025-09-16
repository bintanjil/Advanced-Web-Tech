import { IsString, IsEmail, IsOptional, MinLength, Matches, IsDateString } from 'class-validator';


export class UpdateCustomerDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  fullName?: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak - must contain at least 1 uppercase, 1 lowercase, and 1 number or special character'
  })
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @Matches(/^\+?[\d\s-]+$/, {
    message: 'Invalid phone number format'
  })
  @IsOptional()
  phone?: string;

  @IsDateString({}, {
    message: 'Invalid date format for dateOfBirth'
  })
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
