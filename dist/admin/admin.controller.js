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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const add_admin_dto_1 = require("./add-admin.dto");
const update_admin_dto_1 = require("./update-admin.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const auth_guard_1 = require("../auth/auth.guard");
const add_seller_dto_1 = require("../seller/add-seller.dto");
const seller_service_1 = require("../seller/seller.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const role_enum_1 = require("../auth/role.enum");
const mail_service_1 = require("../mail/mail.service");
let AdminController = class AdminController {
    adminService;
    sellerService;
    mailService;
    constructor(adminService, sellerService, mailService) {
        this.adminService = adminService;
        this.sellerService = sellerService;
        this.mailService = mailService;
    }
    async testMail(email) {
        if (!email) {
            return {
                success: false,
                message: 'Email address is required'
            };
        }
        return await this.mailService.testEmail(email);
    }
    async getAllAdmins() {
        return await this.adminService.findAll();
    }
    async getAdminById(id) {
        return await this.adminService.getAdminById(id);
    }
    async updateAdmin(id, updateAdminDto) {
        return await this.adminService.updateAdmin(id, updateAdminDto);
    }
    async changeStatus(id, status) {
        return await this.adminService.changeStatus(id, status);
    }
    async olderThan(age) {
        return await this.adminService.getOlderThan(age);
    }
    async getInactiveAdmins() {
        return await this.adminService.getInactive();
    }
    async deleteAdmin(id) {
        await this.adminService.deleteAdmin(id);
        return { message: `Admin with id ${id} deleted successfully` };
    }
    async addAdmin(addAdminDto, file) {
        console.log(file);
        if (file) {
            addAdminDto.fileName = file.filename;
        }
        return await this.adminService.createAdmin(addAdminDto);
    }
    testProtected() {
        return {
            message: 'You are authenticated',
        };
    }
    async createSeller(dto, req, file) {
        if (req.user.role !== 'admin') {
            throw new common_1.UnauthorizedException('Only admins can create sellers');
        }
        if (file) {
            dto.fileName = file.filename;
        }
        return this.sellerService.createSeller(dto, req.user.sub);
    }
    async mySellers(req) {
        if (req.user.role !== 'admin')
            throw new common_1.UnauthorizedException();
        return this.adminService.getSellersByAdmin(req.user.sub);
    }
    async searchAllSellers(query, req) {
        if (req.user.role !== 'admin')
            throw new common_1.UnauthorizedException();
        return this.sellerService.searchSeller(query ?? '');
    }
    async getInactiveSellers(req) {
        if (req.user.role !== 'admin')
            throw new common_1.UnauthorizedException();
        return this.sellerService.getInactiveSellers();
    }
    async getActiveSeller(req) {
        if (req.user.role !== 'admin')
            throw new common_1.UnauthorizedException();
        return this.sellerService.getActiveSellers();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('testMail'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "testMail", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Get)("byId/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminById", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Patch)('updateStatus/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)('upper/:age'),
    __param(0, (0, common_1.Param)('age', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "olderThan", null);
__decorate([
    (0, common_1.Get)('inactive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getInactiveAdmins", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAdmin", null);
__decorate([
    (0, common_1.Post)('createAdmin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('myfile', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => {
                cb(null, Date.now() + '_' + file.originalname);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
                cb(null, true);
            }
            else {
                cb(new Error('Wrong Format'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_admin_dto_1.AddAdminDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addAdmin", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "testProtected", null);
__decorate([
    (0, common_1.Post)('seller'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: (req, file, cb) => {
                cb(null, Date.now() + '_' + file.originalname);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_seller_dto_1.AddSellerDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSeller", null);
__decorate([
    (0, common_1.Get)('mySellers'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "mySellers", null);
__decorate([
    (0, common_1.Get)('sellers/search'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "searchAllSellers", null);
__decorate([
    (0, common_1.Get)('sellers/inactive'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getInactiveSellers", null);
__decorate([
    (0, common_1.Get)('sellers/active'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActiveSeller", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("admin"),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        seller_service_1.SellerService,
        mail_service_1.MailService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map