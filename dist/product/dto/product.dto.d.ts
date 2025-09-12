export declare enum GadgetCategory {
    SMARTPHONE = "smartphone",
    LAPTOP = "laptop",
    TABLET = "tablet",
    SMARTWATCH = "smartwatch",
    CAMERA = "camera",
    HEADPHONE = "headphone",
    GAMING = "gaming",
    ACCESSORIES = "accessories"
}
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: GadgetCategory;
    fileName?: string;
    discount?: number;
    isActive?: boolean;
    specs?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: GadgetCategory;
    fileName?: string;
    discount?: number;
    isActive?: boolean;
    specs?: string;
}
