import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MailService } from './mail.service';
import { Roles } from '../auth/roles.decorator';
import { SendEmailDto } from './send-email.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async testEmail(@Body('email') email: string) {
    if (!email) {
      return {
        success: false,
        message: 'Email address is required'
      };
    }
    return this.mailService.testEmail(email);
  }

  @UseGuards(AuthGuard)
  @Post('admin/welcome')
  async sendAdminWelcome(@Body() data: { email: string; name: string }) {
    try {
      await this.mailService.sendAdminWelcomeEmail(data.email, data.name);
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      };
    }
  }
  @Post('welcomeCustomer')
  async sendCustomerWelcomeEmail(@Body() sendEmailDto: SendEmailDto) {
    try { 
      await this.mailService.sendAdminWelcomeEmail(
        sendEmailDto.name,
        sendEmailDto.email,
      );
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      };
    }
  }

}