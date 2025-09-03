import { IsEmail, IsOptional, Matches, MinLength, IsIn } from 'class-validator';

export class UpdateSellerDto {
  @IsOptional()
  @MinLength(5)
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name must not contain special characters or numbers' })
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @Matches(/^01\d{9}$/, { message: 'Phone number must start with 01 and be 11 digits' })
  phone?: string;

  @IsOptional()
  fileName?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], { message: 'Status must be either active or inactive' })
  status?: 'active' | 'inactive';
}
