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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const customer_service_1 = require("./customer.service");
const add_customer_dto_1 = require("./dto/add-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const path_1 = require("path");
const update_address_dto_1 = require("./dto/update-address.dto");
const add_address_dto_1 = require("./dto/add-address.dto");
let CustomerController = class CustomerController {
    customerService;
    constructor(customerService) {
        this.customerService = customerService;
    }
    async getAllCustomers() {
        try {
            return await this.customerService.findAll();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch customers');
        }
    }
    async getProfile(req) {
        try {
            const customer = await this.customerService.getCustomerById(req.user.sub);
            if (!customer) {
                throw new common_1.NotFoundException('Profile not found');
            }
            return customer;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to fetch profile');
        }
    }
    async getCustomerById(id, req) {
        try {
            if (req.user.role === 'customer' && req.user.sub !== id) {
                throw new common_1.ForbiddenException('You can only view your own profile');
            }
            const customer = await this.customerService.getCustomerById(id);
            if (!customer) {
                throw new common_1.NotFoundException('Customer not found');
            }
            return customer;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to fetch customer');
        }
    }
    async searchCustomers(query) {
        try {
            return await this.customerService.findByFullNameSubstring(query);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to search customers');
        }
    }
    async removeCustomer(id, req) {
        try {
            if (req.user.role === 'customer' && req.user.sub !== id) {
                throw new common_1.ForbiddenException('You can only delete your own account');
            }
            const result = await this.customerService.removeCustomer(id);
            if (!result) {
                throw new common_1.NotFoundException('Customer not found');
            }
            return { message: 'Customer successfully deleted' };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to delete customer');
        }
    }
    async create(addCustomerDto) {
        try {
            const customer = await this.customerService.createCustomer(addCustomerDto);
            return { message: 'Customer created successfully', customer };
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.BadRequestException('Customer creation failed');
        }
    }
    async uploadProfileImage(file, req) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('Profile image is required');
            }
            const result = await this.customerService.updateProfileImage(req.user.sub, file.filename);
            return { message: 'Profile image updated successfully', fileName: file.filename };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('Failed to update profile image');
        }
    }
    async updateProfile(updateCustomerDto, req) {
        try {
            const updated = await this.customerService.updateCustomer(req.user.sub, updateCustomerDto);
            if (!updated) {
                throw new common_1.NotFoundException('Profile not found');
            }
            return { message: 'Profile updated successfully', customer: updated };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to update profile');
        }
    }
    async addAddress(addAddressDto, req) {
        try {
            const address = await this.customerService.addAddress(req.user.sub, addAddressDto);
            return { message: 'Address added successfully', address };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to add address');
        }
    }
    async updateAddress(addressId, updateAddressDto, req) {
        try {
            const address = await this.customerService.updateAddress(req.user.sub, addressId, updateAddressDto);
            if (!address) {
                throw new common_1.NotFoundException('Address not found');
            }
            return { message: 'Address updated successfully', address };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to update address');
        }
    }
    async removeAddress(addressId, req) {
        try {
            const result = await this.customerService.removeAddress(req.user.sub, addressId);
            if (!result) {
                throw new common_1.NotFoundException('Address not found');
            }
            return { message: 'Address removed successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('Failed to remove address');
        }
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('byId/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerById", null);
__decorate([
    (0, common_1.Get)('search/:query'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "searchCustomers", null);
__decorate([
    (0, common_1.Delete)(':id/remove'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeCustomer", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_customer_dto_1.AddCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('profileImage'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_customer_dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('addresses'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_address_dto_1.AddAddressDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Put)('updateAddress/:addressId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('addressId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_address_dto_1.UpdateAddressDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('me/addresses/:addressId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('addressId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeAddress", null);
exports.CustomerController = CustomerController = __decorate([
    (0, common_1.Controller)('customer'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map