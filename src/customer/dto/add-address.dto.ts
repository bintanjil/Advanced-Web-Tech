import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  type?: string; // 'home', 'work', etc.

  @IsString()
  @IsOptional()
  additionalInfo?: string;
}
