import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, content: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text: content
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendAdminWelcomeEmail(email: string, name: string) {
    const content = `Welcome ${name},\n\nYour admin account has been created.\n\nBest regards,\nThe Gadgeto Team`;
    await this.sendEmail(email, 'Welcome to Admin Panel', content);
  }

  async sendCustomerWelcomeEmail(name: string, email: string) {
    const content = `Welcome ${name},\n\nYour account has been created with email: ${email}\n\nBest regards,\nThe Gadgeto Team`;
    await this.sendEmail(email, 'Welcome to The Gadgeto', content);
  }

  async sendSellerWelcomeEmail(name: string, email: string, password: string) {
    const content = `Welcome ${name},\n\nYour seller account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after login.\n\nBest regards,\nThe Gadgeto Team`;
    await this.sendEmail(email, 'Welcome to The Gadgeto Seller Portal', content);
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const content = `Hello,\n\nClick this link to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Gadgeto Team`;
    await this.sendEmail(email, 'Password Reset Request', content);
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
}