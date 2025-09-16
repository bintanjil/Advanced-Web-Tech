import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { MailService } from "../mail/mail.service";
import { AddCustomerDto } from "./dto/add-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as multer from "multer";
import { Express } from "express";
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { extname } from 'path';
import { UpdateAddressDto } from "./dto/update-address.dto";
import { AddAddressDto } from "./dto/add-address.dto";
import { OrderItemDto } from "src/order/dto/add-order.dto";

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly mailService: MailService,
  ) {}
    
  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async getAllCustomers() {
    try {
      return await this.customerService.findAll();
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req) {
    try {
      const customer = await this.customerService.getCustomerById(req.user.sub);
      if (!customer) {
        throw new NotFoundException('Profile not found');
      }
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch profile');
    }
  }

  @Get('byId/:id')
  @UseGuards(AuthGuard)
  async getCustomerById(@Param('id') id: string, @Request() req) {
    try {
      // Customers can only view their own profile
      if (req.user.role === 'customer' && req.user.sub !== id) {
        throw new ForbiddenException('You can only view your own profile');
      }

      const customer = await this.customerService.getCustomerById(id);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      return customer;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch customer');
    }
  }

  @Get('search/:query')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async searchCustomers(@Param('query') query: string) {
    try {
      return await this.customerService.findByFullNameSubstring(query);
    } catch (error) {
      throw new BadRequestException('Failed to search customers');
    }
  }

  @Delete(':id/remove')
  @UseGuards(AuthGuard)
  async removeCustomer(@Param('id') id: string, @Request() req) {
    try {
      // Only admins can delete any account, customers can only delete their own
      if (req.user.role === 'customer' && req.user.sub !== id) {
        throw new ForbiddenException('You can only delete your own account');
      }

      const result = await this.customerService.removeCustomer(id);
      if (!result) {
        throw new NotFoundException('Customer not found');
      }
      return { message: 'Customer successfully deleted' };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete customer');
    }
  }

  @Public()
  @Post('create')
  async create(@Body() addCustomerDto: AddCustomerDto) {
    try {
      const customer = await this.customerService.createCustomer(addCustomerDto);
      
      // Send welcome email asynchronously (don't wait for it to complete)
      this.mailService.sendCustomerWelcomeEmail(customer.email, customer.fullName)
        .then((result) => {
          if (result.success) {
            console.log(`Welcome email sent successfully to ${customer.email}`);
          } else {
            console.error(`Failed to send welcome email to ${customer.email}:`, result.error);
          }
        })
        .catch((error) => {
          console.error(`Error sending welcome email to ${customer.email}:`, error);
        });

      return { message: 'Customer created successfully', customer };
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Email already registered');
      }
      throw new BadRequestException('Customer creation failed');
    }
  }

  @Post('profileImage')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Profile image is required');
      }

      const result = await this.customerService.updateProfileImage(req.user.sub, file.filename);
      return { message: 'Profile image updated successfully', fileName: file.filename };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to update profile image');
    }
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    try {
      const updated = await this.customerService.updateCustomer(
        req.user.sub,
        updateCustomerDto,
      );
      if (!updated) {
        throw new NotFoundException('Profile not found');
      }
      return { message: 'Profile updated successfully', customer: updated };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update profile');
    }
  }

  @Post('addresses')
  @UseGuards(AuthGuard)
  async addAddress(@Body() addAddressDto: AddAddressDto, @Request() req) {
    try {
      const address = await this.customerService.addAddress(req.user.sub, addAddressDto);
      return { message: 'Address added successfully', address };
    } catch (error) {
      throw new BadRequestException('Failed to add address');
    }
  }

  @Put('updateAddress/:addressId')
  @UseGuards(AuthGuard)
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req,
  ) {
    try {
      const address = await this.customerService.updateAddress(
        req.user.sub,
        addressId,
        updateAddressDto,
      );
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return { message: 'Address updated successfully', address };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update address');
    }
  }

  @Delete('me/addresses/:addressId')
  @UseGuards(AuthGuard)
  async removeAddress(@Param('addressId') addressId: string, @Request() req) {
    try {
      const result = await this.customerService.removeAddress(req.user.sub, addressId);
      if (!result) {
        throw new NotFoundException('Address not found');
      }
      return { message: 'Address removed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to remove address');
    }
  }

  @Public()
  @Post('add')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async addCustomer(
    @Body() addCustomerDto: AddCustomerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // If file is uploaded, add fileName to DTO
      if (file) {
        addCustomerDto.fileName = file.filename;
      }
      
      const customer = await this.customerService.createCustomer(addCustomerDto);
      
      // Send welcome email asynchronously (don't wait for it to complete)
      this.mailService.sendCustomerWelcomeEmail(customer.email, customer.fullName)
        .then((result) => {
          if (result.success) {
            console.log(`Welcome email sent successfully to ${customer.email}`);
          } else {
            console.error(`Failed to send welcome email to ${customer.email}:`, result.error);
          }
        })
        .catch((error) => {
          console.error(`Error sending welcome email to ${customer.email}:`, error);
        });
      
      // Remove password from response
      const { password, ...customerResponse } = customer;
      
      return { message: 'Customer created successfully', customer: customerResponse };
    } catch (error) {
      // Handle database constraint errors
      if (error.code === '23505') {
        throw new ConflictException('Username or email already exists');
      }
      
      // Re-throw ConflictExceptions from the service (username/email exists)
      if (error instanceof ConflictException) {
        throw error;
      }
      
      console.error('Customer creation error:', error);
      throw new BadRequestException(error.message || 'Customer creation failed');
    }
  }
}




