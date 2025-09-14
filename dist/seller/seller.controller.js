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
exports.SellerController = void 0;
const common_1 = require("@nestjs/common");
const seller_service_1 = require("./seller.service");
const add_seller_dto_1 = require("./add-seller.dto");
const update_seller_dto_1 = require("./update-seller.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const role_enum_1 = require("../auth/role.enum");
const roles_guard_1 = require("../auth/roles.guard");
let SellerController = class SellerController {
    sellerService;
    constructor(sellerService) {
        this.sellerService = sellerService;
    }
    async getAllSellers(req) {
        try {
            const sellers = await this.sellerService.findAll();
            return {
                success: true,
                data: sellers
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Failed to fetch sellers');
        }
    }
    async getSellerById(id, req) {
        if (req.user.role === role_enum_1.Role.SELLER && req.user.sub !== id) {
            throw new common_1.ForbiddenException('You can only view your own profile');
        }
        return this.sellerService.getSellerById(id);
    }
    async registerSeller(addSellerDto, file) {
        try {
            if (file)
                addSellerDto.fileName = file.filename;
            const result = await this.sellerService.createSeller(addSellerDto, 0);
            return {
                success: true,
                message: 'Seller registered successfully',
                data: result
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Failed to register seller');
        }
    }
    async createSeller(addSellerDto, file, req) {
        if (file)
            addSellerDto.fileName = file.filename;
        return this.sellerService.createSeller(addSellerDto, req.user.sub);
    }
    async updateSeller(id, dto, file, req) {
        if (req.user.role === role_enum_1.Role.SELLER && req.user.sub !== id) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        if (file)
            dto.fileName = file.filename;
        return this.sellerService.updateSeller(id, dto, req.user.sub);
    }
    async changeSellerStatus(id, status, req) {
        const seller = await this.sellerService.changeSellerStatus(id, status, req.user.sub);
        return {
            success: true,
            message: `Seller status updated to ${status}`,
            data: seller
        };
    }
    async deleteSeller(id, req) {
        await this.sellerService.deleteSeller(id, req.user.sub);
        return {
            success: true,
            message: `Seller with id ${id} deleted successfully`
        };
    }
    async searchSellers(query) {
        return this.sellerService.searchSeller(query ?? '');
    }
    async getSellersByAdmin(req) {
        try {
            const sellers = await this.sellerService.getSellersByAdmin(req.user.sub);
            console.log('Sellers found:', sellers);
            return {
                success: true,
                data: sellers
            };
        }
        catch (error) {
            console.error('Error fetching sellers:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Failed to fetch sellers data');
        }
    }
    async updateOwnSeller(dto, file, req) {
        if (file)
            dto.fileName = file.filename;
        return this.sellerService.updateOwnSeller(req.user.sub, dto);
    }
    async getActiveSellers() {
        return this.sellerService.getActiveSellers();
    }
    async getInactiveSellers() {
        return this.sellerService.getInactiveSellers();
    }
    async getOwnProfile(req) {
        return this.sellerService.getSellerById(req.user.sub);
    }
    async getOwnProducts(req) {
        return this.sellerService.getSellerProducts(req.user.sub);
    }
    async getOwnOrders(req) {
        return this.sellerService.getSellerOrders(req.user.sub);
    }
};
exports.SellerController = SellerController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getAllSellers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SELLER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getSellerById", null);
__decorate([
    (0, common_1.Post)('registration'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_seller_dto_1.AddSellerDto, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "registerSeller", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('myfile', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_seller_dto_1.AddSellerDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "createSeller", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.SELLER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
        }),
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_seller_dto_1.UpdateSellerDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "updateSeller", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "changeSellerStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "deleteSeller", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "searchSellers", null);
__decorate([
    (0, common_1.Get)('admin/mySellers'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getSellersByAdmin", null);
__decorate([
    (0, common_1.Put)('update/profile'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SELLER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_seller_dto_1.UpdateSellerDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "updateOwnSeller", null);
__decorate([
    (0, common_1.Get)('active/list'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getActiveSellers", null);
__decorate([
    (0, common_1.Get)('inactive/list'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getInactiveSellers", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SELLER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getOwnProfile", null);
__decorate([
    (0, common_1.Get)('me/products'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SELLER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getOwnProducts", null);
__decorate([
    (0, common_1.Get)('me/orders'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SELLER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getOwnOrders", null);
exports.SellerController = SellerController = __decorate([
    (0, common_1.Controller)('seller'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [seller_service_1.SellerService])
], SellerController);
//# sourceMappingURL=seller.controller.js.map