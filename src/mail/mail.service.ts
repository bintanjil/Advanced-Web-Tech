import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}:`, error);
      // Fallback to simple template
      return this.getFallbackTemplate(templateName, context);
    }
  }

  private getFallbackTemplate(templateName: string, context: any): string {
    const platformName = process.env.PLATFORM_NAME || 'E-Commerce Platform';
    const currentYear = new Date().getFullYear();
    
    const footer = `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This is an automated message from ${platformName}. Please do not reply to this email.</p>
        <p>If you need assistance, please contact our support team through the platform.</p>
        <p>&copy; ${currentYear} ${platformName}. All rights reserved.</p>
      </div>
    `;

    switch (templateName) {
      case 'seller-welcome':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333; margin: 0;">Welcome to ${platformName}</h1>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #333;">Dear Seller,</p>
              
              <p style="color: #333;">Your seller account has been successfully created. Below are your account details:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${context.email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${context.password}</p>
              </div>
              
              <p style="color: #333; font-weight: bold;">Important Security Notice:</p>
              <ul style="color: #333;">
                <li>Please change your password immediately after your first login</li>
                <li>Keep your login credentials secure and do not share them with others</li>
                <li>Ensure you're using a strong password</li>
              </ul>
              
              <p style="color: #333;">To get started, please visit our seller portal and log in with the credentials above.</p>
              
              <p style="color: #333;">Best regards,<br>The ${platformName} Team</p>
            </div>
            ${footer}
          </div>
        `;
      case 'admin-welcome':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333; margin: 0;">Welcome to ${platformName}</h1>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #333;">Dear Administrator,</p>
              
              <p style="color: #333;">Your administrator account has been successfully created with:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${context.email}</p>
              </div>
              
              <p style="color: #333;">You now have access to the administrative features of our platform.</p>
              
              <p style="color: #333;">Best regards,<br>The ${platformName} Team</p>
            </div>
            ${footer}
          </div>
        `;
      default:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #333;">${context.message || 'Notification from our platform'}</p>
            </div>
            ${footer}
          </div>
        `;
    }
  }

  async sendSellerWelcomeEmail(email: string, password: string): Promise<boolean> {
    try {
      const htmlContent = this.compileTemplate('seller-welcome', {
        email,
        password,
        platformName: process.env.PLATFORM_NAME || 'Our E-commerce Platform'
      });

      await this.transporter.sendMail({
        from: `"${process.env.PLATFORM_NAME || 'E-Commerce Platform'}" <noreply@${process.env.MAIL_DOMAIN || 'ecommerce.com'}>`,
        to: email,
        subject: `Welcome to ${process.env.PLATFORM_NAME || 'E-Commerce Platform'} - Seller Account Created`,
        html: htmlContent,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Priority': '3',
          'Precedence': 'bulk'
        },
      });
      
      this.logger.log(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending seller welcome email:', error);
      return false;
    }
  }

  async sendAdminWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const htmlContent = this.compileTemplate('admin-welcome', {
        email,
        name,
        platformName: process.env.PLATFORM_NAME || 'Our E-commerce Platform'
      });

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'E-commerce Platform'}" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Our Admin Panel',
        html: htmlContent,
      });
      
      this.logger.log(`Welcome email sent successfully to admin ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending admin welcome email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const htmlContent = this.compileTemplate('password-reset', {
        email,
        resetLink,
        platformName: process.env.PLATFORM_NAME || 'Our E-commerce Platform'
      });

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'E-commerce Platform'}" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request',
        html: htmlContent,
      });
      
      this.logger.log(`Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      return false;
    }
  }
}