import { MailService } from './mail.service';
import { SendEmailDto } from './send-email.dto';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    testEmail(email: string): Promise<{
        success: boolean;
        message: string;
        error: any;
    } | {
        success: boolean;
        message: string;
    }>;
    sendAdminWelcome(data: {
        email: string;
        name: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    sendCustomerWelcomeEmail(sendEmailDto: SendEmailDto): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
}
