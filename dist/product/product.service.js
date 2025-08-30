"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const seller_service_1 = require("../seller/seller.service");
let ProductService = class ProductService {
    productRepository;
    sellerService;
    constructor(productRepository, sellerService) {
        this.productRepository = productRepository;
        this.sellerService = sellerService;
    }
    async verifySellerOwnership(productId, sellerId) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.seller.id !== sellerId) {
            throw new common_1.ForbiddenException('You can only modify your own products');
        }
        return product;
    }
    async addProduct(productDto, sellerId) {
        const seller = await this.sellerService.getSellerById(sellerId);
        if (!seller) {
            throw new common_1.NotFoundException(`Seller not found with ID ${sellerId}`);
        }
        const product = this.productRepository.create({
            ...productDto,
            seller
        });
        const savedProduct = await this.productRepository.save(product);
        return this.getProductWithSeller(savedProduct.id);
    }
    async updateProduct(id, updateData, sellerId) {
        const product = await this.verifySellerOwnership(id, sellerId);
        Object.assign(product, updateData);
        await this.productRepository.save(product);
        return this.getProductWithSeller(id);
    }
    async deleteProduct(id, sellerId) {
        await this.verifySellerOwnership(id, sellerId);
        await this.productRepository.delete(id);
    }
    async applyDiscount(id, discount, sellerId) {
        if (discount < 0 || discount > 100) {
            throw new common_1.ForbiddenException('Discount must be between 0 and 100');
        }
        const product = await this.verifySellerOwnership(id, sellerId);
        product.discount = discount;
        await this.productRepository.save(product);
        return this.getProductWithSeller(id);
    }
    async getProductWithSeller(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['seller']
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async getProductsBySeller(sellerId) {
        return this.productRepository.find({
            where: { seller: { id: sellerId } },
            relations: ['seller']
        });
    }
    async getAllProducts() {
        return this.productRepository.find({
            relations: ['seller']
        });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        seller_service_1.SellerService])
], ProductService);
//# sourceMappingURL=product.service.js.map