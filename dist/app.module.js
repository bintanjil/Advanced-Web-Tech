"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const admin_module_1 = require("./admin/admin.module");
const config_1 = require("@nestjs/config");
const product_module_1 = require("./product/product.module");
const customer_module_1 = require("./customer/customer.module");
const typeorm_1 = require("@nestjs/typeorm");
const admin_entity_1 = require("./admin/admin.entity");
const seller_entity_1 = require("./seller/seller.entity");
const product_entity_1 = require("./product/product.entity");
const customer_entity_1 = require("./customer/customer.entity");
const order_entity_1 = require("./order/order.entity");
const order_item_entity_1 = require("./order/order-item.entity");
const auth_module_1 = require("./auth/auth.module");
const mail_module_1 = require("./mail/mail.module");
const order_module_1 = require("./order/order.module");
const address_entity_1 = require("./customer/address.entity");
const review_entity_1 = require("./review/review.entity");
const discount_entity_1 = require("./discount/discount.entity");
const category_entity_1 = require("./category/category.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: 'admin',
                database: 'ecommerce',
                entities: [admin_entity_1.Admin, customer_entity_1.Customer, seller_entity_1.Seller, product_entity_1.Product, order_entity_1.Order, order_item_entity_1.OrderItem, address_entity_1.Address, review_entity_1.Review, discount_entity_1.Discount, category_entity_1.Category],
                synchronize: true,
            }),
            admin_module_1.AdminModule, product_module_1.ProductModule, customer_module_1.CustomerModule, auth_module_1.AuthModule, mail_module_1.MailModule, order_module_1.OrderModule
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map