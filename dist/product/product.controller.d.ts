import { ProductService } from './product.service';
import { AddProductDto } from './add-product.dto';
import { UpdateProductDto } from './update-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    getAllProducts(): Promise<import("./product.entity").Product[]>;
    getProductById(id: number): Promise<import("./product.entity").Product>;
    getMyProducts(req: any): Promise<import("./product.entity").Product[]>;
    addProduct(productDto: AddProductDto, file: Express.Multer.File, req: any): Promise<import("./product.entity").Product>;
    updateProduct(id: number, updateData: UpdateProductDto, file: Express.Multer.File, req: any): Promise<import("./product.entity").Product>;
    deleteProduct(id: number, req: any): Promise<void>;
    applyDiscount(id: number, discount: number, req: any): Promise<import("./product.entity").Product>;
}
