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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_entity_1 = require("./admin.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const mail_service_1 = require("../mail/mail.service");
let AdminService = AdminService_1 = class AdminService {
    adminRepository;
    mailService;
    salt = 10;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(adminRepository, mailService) {
        this.adminRepository = adminRepository;
        this.mailService = mailService;
    }
    async findAll() {
        return this.adminRepository.find();
    }
    async getAdminById(id) {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin)
            throw new common_1.NotFoundException("Admin not found");
        return admin;
    }
    async createAdmin(addAdminDto) {
        const idExist = await this.adminRepository.findOne({ where: { id: addAdminDto.id } });
        if (idExist)
            throw new common_1.ConflictException('Admin with the same ID already exists');
        const emailExists = await this.adminRepository.findOne({ where: { email: addAdminDto.email } });
        if (emailExists)
            throw new common_1.ConflictException('Email already in use');
        const phoneExists = await this.adminRepository.findOne({ where: { phone: addAdminDto.phone } });
        if (phoneExists)
            throw new common_1.ConflictException('Phone number already in use');
        const hashedPassword = await bcrypt.hash(addAdminDto.password, this.salt);
        const newCreatedAdmin = this.adminRepository.create({
            ...addAdminDto,
            password: hashedPassword
        });
        const savedAdmin = await this.adminRepository.save(newCreatedAdmin);
        try {
            await this.mailService.sendAdminWelcomeEmail(savedAdmin.email, savedAdmin.name);
        }
        catch (error) {
            this.logger.error('Failed to send welcome email to admin', error);
        }
        return savedAdmin;
    }
    async updateAdmin(id, updateAdminDto) {
        const admin = await this.getAdminById(id);
        if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
            const existingAdmin = await this.adminRepository.findOne({ where: { email: updateAdminDto.email } });
            if (existingAdmin)
                throw new common_1.ConflictException('Email already exists');
        }
        if (updateAdminDto.phone && updateAdminDto.phone !== admin.phone) {
            const phoneExists = await this.adminRepository.findOne({ where: { phone: updateAdminDto.phone } });
            if (phoneExists)
                throw new common_1.ConflictException('Phone number already exists');
        }
        if (updateAdminDto.password) {
            updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, this.salt);
        }
        return await this.adminRepository.save({ ...admin, ...updateAdminDto });
    }
    async changeStatus(id, status) {
        const admin = await this.getAdminById(id);
        admin.status = status;
        return await this.adminRepository.save(admin);
    }
    async deleteAdmin(id) {
        const admin = await this.getAdminById(id);
        await this.adminRepository.remove(admin);
    }
    async getInactive() {
        return await this.adminRepository.find({ where: { status: 'inactive' } });
    }
    async getOlderThan(age) {
        return await this.adminRepository.createQueryBuilder('admin').where('admin.age> :age', { age }).getMany();
    }
    async findByEmail(email) {
        return this.adminRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password']
        });
    }
    async getSellersByAdmin(adminId) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: ['sellers'],
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        return admin.sellers ?? [];
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], AdminService);
//# sourceMappingURL=admin.service.js.map