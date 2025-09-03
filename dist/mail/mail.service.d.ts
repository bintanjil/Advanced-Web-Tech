import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendEmail(to: string, subject: string, content: string): Promise<void>;
    sendAdminWelcomeEmail(email: string, name: string): Promise<void>;
    sendCustomerWelcomeEmail(name: string, email: string): Promise<void>;
    sendSellerWelcomeEmail(name: string, email: string, password: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
    checkMail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
