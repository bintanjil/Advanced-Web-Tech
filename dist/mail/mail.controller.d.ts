import { MailService } from './mail.service';
import { SendEmailDto } from './send-email.dto';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    sendWelcomeEmail(sendEmailDto: SendEmailDto): Promise<{
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
