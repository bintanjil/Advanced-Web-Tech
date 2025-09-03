import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class AddSellerDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01\d{9}$/, {
    message: 'Phone number must start with 01 and be 11 digits',
  })
  phone: string;

  @IsNotEmpty({ message: 'NID number is required' })
  @Matches(/^\d{10,17}$/, {
    message: 'Bangladeshi NID must be exactly 10 digits',
  })
  nid: string;

  @IsOptional()
  fileName?: string;
}
