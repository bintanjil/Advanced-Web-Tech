import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { AddProductDto } from './add-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { SellerService } from '../seller/seller.service';
export declare class ProductService {
    private readonly productRepository;
    private readonly sellerService;
    constructor(productRepository: Repository<Product>, sellerService: SellerService);
    private verifySellerOwnership;
    addProduct(productDto: AddProductDto, sellerId: number): Promise<Product>;
    updateProduct(id: number, updateData: UpdateProductDto, sellerId: number): Promise<Product>;
    deleteProduct(id: number, sellerId: number): Promise<void>;
    applyDiscount(id: number, discount: number, sellerId: number): Promise<Product>;
    getProductWithSeller(id: number): Promise<Product>;
    getProductsBySeller(sellerId: number): Promise<Product[]>;
    getAllProducts(): Promise<Product[]>;
}
