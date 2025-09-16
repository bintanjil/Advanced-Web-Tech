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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const add_product_dto_1 = require("./add-product.dto");
const update_product_dto_1 = require("./update-product.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async getAllProducts() {
        return await this.productService.getAllProducts();
    }
    async getProductById(id) {
        return await this.productService.getProductWithSeller(id);
    }
    async getMyProducts(req) {
        if (req.user.role !== 'seller') {
            throw new common_1.UnauthorizedException('Only sellers can access this endpoint');
        }
        return await this.productService.getProductsBySeller(req.user.sub);
    }
    async addProduct(productDto, file, req) {
        if (req.user.role !== 'seller') {
            throw new common_1.UnauthorizedException('Only sellers can add products');
        }
        if (file)
            productDto.fileName = file.filename;
        return await this.productService.addProduct(productDto, req.user.sub);
    }
    async updateProduct(id, updateData, file, req) {
        if (req.user.role !== 'seller') {
            throw new common_1.UnauthorizedException('Only sellers can update products');
        }
        if (file)
            updateData.fileName = file.filename;
        return await this.productService.updateProduct(id, updateData, req.user.sub);
    }
    async deleteProduct(id, req) {
        if (req.user.role !== 'seller') {
            throw new common_1.UnauthorizedException('Only sellers can delete products');
        }
        return await this.productService.deleteProduct(id, req.user.sub);
    }
    async applyDiscount(id, discount, req) {
        if (req.user.role !== 'seller') {
            throw new common_1.UnauthorizedException('Only sellers can apply discounts');
        }
        return await this.productService.applyDiscount(id, discount, req.user.sub);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProducts", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Get)('seller/myProducts'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('seller'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getMyProducts", null);
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('seller'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i))
                cb(null, true);
            else
                cb(new Error('Only image files are allowed'), false);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => {
                cb(null, Date.now() + '_' + file.originalname);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_product_dto_1.AddProductDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Put)('seller/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('seller'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i))
                cb(null, true);
            else
                cb(new Error('Only image files are allowed'), false);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => {
                cb(null, Date.now() + '_' + file.originalname);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('seller/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('seller'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Patch)(':id/discount'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('seller'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('discount')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "applyDiscount", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('product'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map