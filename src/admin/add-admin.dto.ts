import { Type } from "class-transformer";
import { 
  IsEmail, 
  IsIn, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  Matches, 
  Min, 
  MinLength 
} from "class-validator";

export class AddAdminDto {
  @IsInt()
  @Min(1, { message: "Id must be a positive number" })
  @Type(() => Number)
  id: number;

  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^[A-Z][a-zA-Z\s]*$/, { 
    message: 'Name should start with a capital letter and contain only alphabets' 
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01\d{9}$/, { message: 'Phone number must be 11 digits and start with 01' })
  phone: string;

  @IsNotEmpty({ message: 'NID number is required' })
  @Matches(/^\d{10,17}$/, {
    message: 'Bangladeshi NID must be 10 to 17 digits',
  })
  nid: string;

  @IsInt()
  @Min(18, { message: "Admin must be at least 18 years old" })
  @Type(() => Number)
  age: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  fileName?: string;
}
