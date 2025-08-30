export declare class MailService {
    private transporter;
    private readonly logger;
    constructor();
    private compileTemplate;
    private getFallbackTemplate;
    sendSellerWelcomeEmail(email: string, password: string): Promise<boolean>;
    sendAdminWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
}
