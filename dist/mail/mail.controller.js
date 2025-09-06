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
exports.MailController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const mail_service_1 = require("./mail.service");
const send_email_dto_1 = require("./send-email.dto");
let MailController = class MailController {
    mailService;
    constructor(mailService) {
        this.mailService = mailService;
    }
    async testEmail(email) {
        if (!email) {
            return {
                success: false,
                message: 'Email address is required'
            };
        }
        return this.mailService.testEmail(email);
    }
    async sendAdminWelcome(data) {
        try {
            await this.mailService.sendAdminWelcomeEmail(data.email, data.name);
            return {
                success: true,
                message: 'Welcome email sent successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to send welcome email',
                error: error.message
            };
        }
    }
    async sendCustomerWelcomeEmail(sendEmailDto) {
        try {
            await this.mailService.sendAdminWelcomeEmail(sendEmailDto.name, sendEmailDto.email);
            return {
                success: true,
                message: 'Welcome email sent successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to send welcome email',
                error: error.message
            };
        }
    }
};
exports.MailController = MailController;
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "testEmail", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('admin/welcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "sendAdminWelcome", null);
__decorate([
    (0, common_1.Post)('welcomeCustomer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "sendCustomerWelcomeEmail", null);
exports.MailController = MailController = __decorate([
    (0, common_1.Controller)('mail'),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], MailController);
//# sourceMappingURL=mail.controller.js.map