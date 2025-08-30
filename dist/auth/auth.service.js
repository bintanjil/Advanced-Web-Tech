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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const seller_service_1 = require("../seller/seller.service");
const admin_service_1 = require("../admin/admin.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const auth_constants_1 = require("./auth.constants");
let AuthService = class AuthService {
    adminService;
    sellerService;
    jwtService;
    constructor(adminService, sellerService, jwtService) {
        this.adminService = adminService;
        this.sellerService = sellerService;
        this.jwtService = jwtService;
    }
    async signIn(email, password) {
        let user = await this.adminService.findByEmail(email);
        let role = 'admin';
        if (!user) {
            user = await this.sellerService.findByEmail(email);
            role = 'seller';
        }
        if (!user)
            throw new common_1.UnauthorizedException('No user found with this email');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid password');
        const payload = {
            sub: user.id,
            email: user.email,
            role: role,
        };
        console.log('Auth payload:', payload);
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: auth_constants_1.jwtConstants.secret,
                expiresIn: '1h',
            }),
        };
    }
    async decodeToken(token) {
        try {
            return this.jwtService.verify(token, { secret: auth_constants_1.jwtConstants.secret });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        seller_service_1.SellerService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map