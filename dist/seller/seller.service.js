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
var SellerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const seller_entity_1 = require("./seller.entity");
const bcrypt = require("bcrypt");
const admin_service_1 = require("../admin/admin.service");
const mail_service_1 = require("../mail/mail.service");
const product_entity_1 = require("../product/product.entity");
const order_entity_1 = require("../order/order.entity");
let SellerService = SellerService_1 = class SellerService {
    sellerRepository;
    productRepository;
    orderRepository;
    adminService;
    mailService;
    salt = 10;
    logger = new common_1.Logger(SellerService_1.name);
    constructor(sellerRepository, productRepository, orderRepository, adminService, mailService) {
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.adminService = adminService;
        this.mailService = mailService;
    }
    async getAllSellers() {
        return this.sellerRepository.find();
    }
    async createSeller(addSellerDto, adminId) {
        if (!addSellerDto.password) {
            throw new common_1.BadRequestException('Password is required');
        }
        const [emailExists, nidExists] = await Promise.all([
            this.sellerRepository.findOne({ where: { email: addSellerDto.email } }),
            this.sellerRepository.findOne({ where: { nid: addSellerDto.nid } }),
        ]);
        if (emailExists)
            throw new common_1.ConflictException('Email already exists');
        if (nidExists)
            throw new common_1.ConflictException('NID already exists');
        const seller = new seller_entity_1.Seller();
        seller.name = addSellerDto.name;
        seller.email = addSellerDto.email;
        seller.password = await bcrypt.hash(addSellerDto.password, this.salt);
        seller.phone = Number(addSellerDto.phone);
        seller.nid = addSellerDto.nid;
        seller.fileName = addSellerDto.fileName;
        const admin = await this.adminService.getAdminById(adminId);
        if (!admin) {
            throw new common_1.NotFoundException(`Admin with ID ${adminId} not found`);
        }
        seller.admin = admin;
        const savedSeller = await this.sellerRepository.save(seller);
        try {
            await this.mailService.sendAdminWelcomeEmail(savedSeller.email, savedSeller.name);
        }
        catch (error) {
            this.logger.error('Failed to send welcome email to seller', error);
        }
        return this.sellerRepository.findOneOrFail({
            where: { id: savedSeller.id },
            relations: ['admin'],
        });
    }
    async changeSellerStatus(id, status, adminId) {
        const seller = await this.sellerRepository.findOne({
            where: { id },
            relations: ['admin'],
        });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        if (!seller.admin || seller.admin.id !== adminId) {
            throw new common_1.UnauthorizedException('You can only update your own sellers');
        }
        seller.status = status;
        return this.sellerRepository.save(seller);
    }
    async findAll() {
        return this.sellerRepository.find({ relations: ['admin'] });
    }
    async getSellerById(id) {
        const seller = await this.sellerRepository.findOne({ where: { id }, relations: ['admin'] });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        return seller;
    }
    async updateSeller(id, updateSellerdto, adminId) {
        const seller = await this.sellerRepository.findOne({ where: { id }, relations: ['admin'] });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        if (!seller.admin || seller.admin.id !== adminId) {
            throw new common_1.UnauthorizedException('You can only update your own sellers');
        }
        if (updateSellerdto.email && updateSellerdto.email !== seller.email) {
            const exists = await this.sellerRepository.findOne({ where: { email: updateSellerdto.email } });
            if (exists)
                throw new common_1.ConflictException('Email already exists');
        }
        if (updateSellerdto.password) {
            updateSellerdto.password = await bcrypt.hash(updateSellerdto.password, this.salt);
        }
        Object.assign(seller, updateSellerdto);
        return this.sellerRepository.save(seller);
    }
    async updateOwnSeller(selfId, dto) {
        const seller = await this.getSellerById(selfId);
        if (dto.email && dto.email !== seller.email) {
            const exists = await this.sellerRepository.findOne({ where: { email: dto.email } });
            if (exists)
                throw new common_1.ConflictException('Email already exists');
        }
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, this.salt);
        }
        Object.assign(seller, dto);
        return this.sellerRepository.save(seller);
    }
    async deleteSeller(id, adminId) {
        const seller = await this.sellerRepository.findOne({
            where: { id },
            relations: ['admin']
        });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        if (!seller.admin || seller.admin.id !== adminId) {
            throw new common_1.UnauthorizedException('You can only delete sellers created by you');
        }
        await this.sellerRepository.delete(id);
    }
    async getSellersByAdmin(adminId) {
        return this.sellerRepository.find({
            where: { admin: { id: adminId } },
            relations: ['admin'],
        });
    }
    async getActiveSellers() {
        return this.sellerRepository.find({ where: { status: 'active' }, relations: ['admin'] });
    }
    async findByEmail(email) {
        const seller = await this.sellerRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password'],
        });
        console.log('Found seller by email:', { id: seller?.id, email: seller?.email });
        return seller;
    }
    async searchSeller(q) {
        return this.sellerRepository
            .createQueryBuilder('seller')
            .where('seller.id = :id', { id: Number(q) })
            .orWhere('seller.name ILIKE :name', { name: `%${q}%` })
            .getMany();
    }
    async getInactiveSellers() {
        return this.sellerRepository.find({
            where: { status: 'inactive' },
            relations: ['admin']
        });
    }
    async getSellerProducts(sellerId) {
        return this.productRepository.find({
            where: { seller: { id: sellerId } },
            relations: ['category', 'reviews', 'discounts'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async getSellerOrders(sellerId) {
        return this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.orderItems', 'orderItem')
            .innerJoin('orderItem.product', 'product')
            .where('product.seller.id = :sellerId', { sellerId })
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.orderItems', 'items')
            .leftJoinAndSelect('items.product', 'orderProduct')
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }
};
exports.SellerService = SellerService;
exports.SellerService = SellerService = SellerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(seller_entity_1.Seller)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => admin_service_1.AdminService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        admin_service_1.AdminService,
        mail_service_1.MailService])
], SellerService);
//# sourceMappingURL=seller.service.js.map