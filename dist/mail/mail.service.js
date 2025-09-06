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
    async testEmail(to) {
        try {
            await this.mailerService.sendMail({
                to: to,
                from: 'researchaiub77@gmail.com',
                subject: 'Test Email from Gadgeto',
                text: 'This is a test email from Gadgeto',
                html: `
          <h1>Test Email</h1>
          <p>This is a test email from Gadgeto E-commerce Platform.</p>
          <p>If you received this email, the mail service is working correctly!</p>
        `,
            });
            return {
                success: true,
                message: 'Test email sent successfully'
            };
        }
        catch (error) {
            console.error('Mail error:', error);
            return {
                success: false,
                message: 'Failed to send email',
                error: error.message
            };
        }
    }
    async sendAdminWelcomeEmail(email, name) {
        const htmlContent = `
      <h2>Welcome to Gadgeto Admin Panel, ${name}!</h2>
      <p>Your admin account has been created successfully.</p>
      <p>You can now access the admin panel and manage the platform.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
        return this.sendEmail(email, 'Welcome to Gadgeto Admin Panel', htmlContent);
    }
    async sendPasswordResetEmail(email, resetLink) {
        const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <br>
      <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <br><br>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
        return this.sendEmail(email, 'Password Reset Request', htmlContent);
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
    async sendEmail(to, subject, htmlContent) {
        try {
            await this.mailerService.sendMail({
                to: to,
                from: 'researchaiub77@gmail.com',
                subject: subject,
                html: htmlContent,
            });
            return {
                success: true,
                message: 'Email sent successfully'
            };
        }
        catch (error) {
            console.error('Mail error:', error);
            return {
                success: false,
                message: 'Failed to send email',
                error: error.message
            };
        }
    }
    async sendCustomerWelcomeEmail(email, name) {
        const htmlContent = `
      <h2>Welcome to Gadgeto, ${name}!</h2>
      <p>Your customer account has been created successfully.</p>
      <p>You can now explore our products and enjoy shopping with us.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
        return this.sendEmail(email, 'Welcome to Gadgeto', htmlContent);
    }
    async sendSellerWelcomeEmail(email, name) {
        const htmlContent = `
      <h2>Welcome to Gadgeto Seller Platform, ${name}!</h2>
      <p>Your seller account has been created successfully.</p>
      <p>You can now list your products and start selling on our platform.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
        return this.sendEmail(email, 'Welcome to Gadgeto Seller Platform', htmlContent);
    }
    async sendOrderConfirmationEmail(email, orderId, orderDetails) {
        const htmlContent = `
      <h2>Order Confirmation - Order #${orderId}</h2>
      <p>Thank you for your order! Here are your order details:</p>
      <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      <br>
      <p>We will notify you once your order is shipped.</p>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
        return this.sendEmail(email, `Order Confirmation - Order #${orderId}`, htmlContent);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map