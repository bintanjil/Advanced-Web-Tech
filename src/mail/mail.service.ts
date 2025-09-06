import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async testEmail(to: string) {
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
    } catch (error) {
      console.error('Mail error:', error);
      return { 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      };
    }
  }

  async sendAdminWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <h2>Welcome to Gadgeto Admin Panel, ${name}!</h2>
      <p>Your admin account has been created successfully.</p>
      <p>You can now access the admin panel and manage the platform.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
    return this.sendEmail(email, 'Welcome to Gadgeto Admin Panel', htmlContent);
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
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

  async checkMail(email: string): Promise<{ success: boolean; message: string }> {
    // Implement your logic to check if the email exists
    const emailExists = false; // Replace with actual check

    if (emailExists) {
      return { success: true, message: 'Email exists' };
    } else {
      return { success: false, message: 'Email does not exist' };
    }
  }

  private async sendEmail(to: string, subject: string, htmlContent: string) {
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
    } catch (error) {
      console.error('Mail error:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }
  async sendCustomerWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <h2>Welcome to Gadgeto, ${name}!</h2>
      <p>Your customer account has been created successfully.</p>
      <p>You can now explore our products and enjoy shopping with us.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
    return this.sendEmail(email, 'Welcome to Gadgeto', htmlContent);
  }
  async sendSellerWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <h2>Welcome to Gadgeto Seller Platform, ${name}!</h2>
      <p>Your seller account has been created successfully.</p>
      <p>You can now list your products and start selling on our platform.</p>
      <br>
      <p>Best regards,<br>The Gadgeto Team</p>
    `;
    return this.sendEmail(email, 'Welcome to Gadgeto Seller Platform', htmlContent);
  }
  async sendOrderConfirmationEmail(email: string, orderId: string, orderDetails: any) {
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
}