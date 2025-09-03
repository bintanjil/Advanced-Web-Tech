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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = class MailService {
    mailerService;
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async sendEmail(to, subject, content) {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                text: content
            });
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
    async sendAdminWelcomeEmail(email, name) {
        const content = `Welcome ${name},\n\nYour admin account has been created.\n\nBest regards,\nThe Gadgeto Team`;
        await this.sendEmail(email, 'Welcome to Admin Panel', content);
    }
    async sendCustomerWelcomeEmail(name, email) {
        const content = `Welcome ${name},\n\nYour account has been created with email: ${email}\n\nBest regards,\nThe Gadgeto Team`;
        await this.sendEmail(email, 'Welcome to The Gadgeto', content);
    }
    async sendSellerWelcomeEmail(name, email, password) {
        const content = `Welcome ${name},\n\nYour seller account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after login.\n\nBest regards,\nThe Gadgeto Team`;
        await this.sendEmail(email, 'Welcome to The Gadgeto Seller Portal', content);
    }
    async sendPasswordResetEmail(email, resetLink) {
        const content = `Hello,\n\nClick this link to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Gadgeto Team`;
        await this.sendEmail(email, 'Password Reset Request', content);
    }
    async checkMail(email) {
        const emailExists = false;
        if (emailExists) {
            return { success: true, message: 'Email exists' };
        }
        else {
            return { success: false, message: 'Email does not exist' };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map