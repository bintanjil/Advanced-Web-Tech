export enum GadgetCategory {
  SMARTPHONE = 'smartphone',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  SMARTWATCH = 'smartwatch',
  HEADPHONES = 'headphones',
  CAMERA = 'camera',
  GAMING = 'gaming',
  ACCESSORIES = 'accessories',
}

export interface ProductSpecs {
  brand: string;
  model: string;
  color: string;
  storage?: string;
  ram?: string;
  processor?: string;
  screenSize?: string;
  batteryCapacity?: string;
  camera?: string;
  connectivity?: string[];
  warranty?: string;
  [key: string]: any; // Allow for additional specifications
}

export interface ProductFilter {
  category?: GadgetCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  brand?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
}
