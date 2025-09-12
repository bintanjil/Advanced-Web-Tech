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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const pusher_service_1 = require("./pusher.service");
const auth_guard_1 = require("../auth/auth.guard");
const role_enum_1 = require("../auth/role.enum");
const roles_decorator_1 = require("../auth/roles.decorator");
let NotificationsController = class NotificationsController {
    pusherService;
    constructor(pusherService) {
        this.pusherService = pusherService;
    }
    async authenticatePusher() {
        return { authenticated: true };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('auth'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "authenticatePusher", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [pusher_service_1.PusherService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map