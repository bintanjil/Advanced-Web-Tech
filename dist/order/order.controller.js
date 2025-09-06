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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const add_order_dto_1 = require("./dto/add-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const role_enum_1 = require("../auth/role.enum");
let OrderController = class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async updateOrderStatus(orderId, updateStatusDto, req) {
        return this.orderService.updateOrderStatus(orderId, req.user.sub, updateStatusDto.status);
    }
    async createOrder(addOrderDto, req) {
        return await this.orderService.createOrder(addOrderDto, req.user.sub);
    }
    async getCustomerOrders(req) {
        return await this.orderService.getCustomerOrders(req.user.sub);
    }
    async getOrders(req) {
        const { role, sub } = req.user;
        switch (role) {
            case role_enum_1.Role.ADMIN:
                return await this.orderService.getAllOrders();
            case 'seller':
                return await this.orderService.getSellerOrders(parseInt(sub));
            case 'customer':
                return await this.orderService.getCustomerOrders(sub);
            default:
                throw new common_1.ForbiddenException('Unauthorized access');
        }
    }
    async getOrderById(id, req) {
        const order = await this.orderService.getOrderById(id);
        const { role, sub } = req.user;
        if (role === 'admin') {
            return order;
        }
        if (role === 'seller') {
            const hasSellerProducts = order.orderItems.some(item => item.product.seller.id === parseInt(sub));
            if (!hasSellerProducts) {
                throw new common_1.ForbiddenException('You can only access orders containing your products');
            }
            return order;
        }
        if (role === 'customer' && order.customer?.id !== sub) {
            throw new common_1.ForbiddenException('You can only access your own orders');
        }
        return order;
    }
    async updateOrder(id, updateOrderDto, req) {
        const order = await this.orderService.getOrderById(id);
        const { role, sub } = req.user;
        if (role === 'admin') {
            return await this.orderService.updateOrder(id, updateOrderDto);
        }
        if (role === 'seller') {
            const hasSellerProducts = order.orderItems.some(item => item.product.seller.id === parseInt(sub));
            if (!hasSellerProducts) {
                throw new common_1.ForbiddenException('You can only update orders containing your products');
            }
            const { status } = updateOrderDto;
            if (!status) {
                throw new common_1.ForbiddenException('Invalid update data');
            }
            return await this.orderService.updateOrder(id, { status });
        }
        if (role === 'customer') {
            if (order.customer?.id !== sub) {
                throw new common_1.ForbiddenException('You can only update your own orders');
            }
            if (updateOrderDto.status && updateOrderDto.status !== 'cancelled') {
                throw new common_1.ForbiddenException('Customers can only cancel orders');
            }
            if (order.status === 'shipped' || order.status === 'delivered') {
                throw new common_1.ForbiddenException('Cannot cancel shipped or delivered orders');
            }
            return await this.orderService.updateOrder(id, { status: 'cancelled' });
        }
        throw new common_1.ForbiddenException('Unauthorized access');
    }
    async cancelOrder(id, req) {
        const order = await this.orderService.getOrderById(id);
        const { role, sub } = req.user;
        if (role === 'customer' && order.customer?.id !== sub) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (role === 'seller') {
            const hasSellerProducts = order.orderItems.some(item => item.product.seller.id === parseInt(sub));
            if (!hasSellerProducts) {
                throw new common_1.ForbiddenException('You can only cancel orders containing your products');
            }
        }
        return await this.orderService.cancelOrder(id);
    }
    async deleteOrder(id) {
        return await this.orderService.cancelOrder(id);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SELLER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_status_dto_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_order_dto_1.AddOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('customer/my-orders'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_dto_1.UpdateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrder", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map