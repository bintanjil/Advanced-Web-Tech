import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';

// Gadget categories for our e-commerce platform
export enum GadgetCategory {
  SMARTPHONE = 'smartphone',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  SMARTWATCH = 'smartwatch',
  CAMERA = 'camera',
  HEADPHONE = 'headphone',
  GAMING = 'gaming',
  ACCESSORIES = 'accessories',
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsEnum(GadgetCategory)
  category: GadgetCategory;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  specs?: string; // Technical specifications in JSON format
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(GadgetCategory)
  category?: GadgetCategory;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  specs?: string;
}
