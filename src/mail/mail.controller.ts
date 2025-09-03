import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MailService } from './mail.service';
import { Roles } from '../auth/roles.decorator';
import { SendEmailDto } from './send-email.dto';

@Controller('mail')
@UseGuards(AuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}


  @Post('welcomeSeller')
  async sendWelcomeEmail(@Body() sendEmailDto: SendEmailDto) {
    try {
      await this.mailService.sendSellerWelcomeEmail(
        sendEmailDto.email,
        sendEmailDto.name,
        sendEmailDto.password
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
  @Post('welcomeCustomer')
  async sendCustomerWelcomeEmail(@Body() sendEmailDto: SendEmailDto) {
    try { 
      await this.mailService.sendCustomerWelcomeEmail(
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