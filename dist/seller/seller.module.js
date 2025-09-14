"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seller_entity_1 = require("./seller.entity");
const product_entity_1 = require("../product/product.entity");
const order_entity_1 = require("../order/order.entity");
const seller_controller_1 = require("./seller.controller");
const seller_service_1 = require("./seller.service");
const admin_module_1 = require("../admin/admin.module");
const mail_module_1 = require("../mail/mail.module");
const jwt_1 = require("@nestjs/jwt");
const auth_constants_1 = require("../auth/auth.constants");
const pusher_module_1 = require("../pusher/pusher.module");
let SellerModule = class SellerModule {
};
exports.SellerModule = SellerModule;
exports.SellerModule = SellerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([seller_entity_1.Seller, product_entity_1.Product, order_entity_1.Order]),
            (0, common_1.forwardRef)(() => admin_module_1.AdminModule),
            mail_module_1.MailModule,
            pusher_module_1.PusherModule,
            jwt_1.JwtModule.register({
                secret: auth_constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '1h' },
            }),
        ],
        controllers: [seller_controller_1.SellerController],
        providers: [seller_service_1.SellerService],
        exports: [seller_service_1.SellerService],
    })
], SellerModule);
//# sourceMappingURL=seller.module.js.map