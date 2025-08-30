import { IsEmail, IsOptional, Matches, MinLength } from "class-validator";

export class UpdateAdminDto {
  @IsOptional()
  @MinLength(5)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @Matches(/^01\d{9}$/, { message: 'Phone number must be 11 digits and start with 01' })
  phone?: string;

  @IsOptional()
  fileName?: string;
}
