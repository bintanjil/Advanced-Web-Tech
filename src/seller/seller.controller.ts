import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  Delete,
  Patch,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { AddSellerDto } from './add-seller.dto';
import { UpdateSellerDto } from './update-seller.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { use } from 'passport';

@Controller('seller')
@UseGuards(AuthGuard, RolesGuard)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

 
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllSellers(@Request() req) {
    try {
      const sellers = await this.sellerService.findAll();
      return {
        success: true,
        data: sellers
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch sellers');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  async getSellerById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Allow sellers to view their own profile
    if (req.user.role === Role.SELLER && req.user.sub !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.sellerService.getSellerById(id);
  }

  @Post('registration')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async registerSeller(
    @Body() addSellerDto: AddSellerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (file) addSellerDto.fileName = file.filename;
      const result = await this.sellerService.createSeller(addSellerDto, 0); // 0 indicates self-registration
      return {
        success: true,
        message: 'Seller registered successfully',
        data: result
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to register seller');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('myfile', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async createSeller(
    @Body() addSellerDto: AddSellerDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (file) addSellerDto.fileName = file.filename;
    return this.sellerService.createSeller(addSellerDto, req.user.sub);
  }


  @Put(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
      }),
    }),
  )
  async updateSeller(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSellerDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    // Allow sellers to update their own profile
    if (req.user.role === Role.SELLER && req.user.sub !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    if (file) dto.fileName = file.filename;
    return this.sellerService.updateSeller(id, dto, req.user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async changeSellerStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive',
    @Request() req,
  ) {
    return this.sellerService.changeSellerStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteSeller(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    await this.sellerService.deleteSeller(id, req.user.sub);
    return { 
      success: true,
      message: `Seller with id ${id} deleted successfully` 
    };
  }

  @Get('search')
  @Roles(Role.ADMIN)
  async searchSellers(@Query('q') query: string) {
    return this.sellerService.searchSeller(query ?? '');
  }

  @Get('admin/mySellers')
  @Roles(Role.ADMIN)
  async getSellersByAdmin(@Request() req) {
    try {
      const sellers = await this.sellerService.getSellersByAdmin(req.user.sub);
      console.log('Sellers found:', sellers); // Debug log
      return {
        success: true,
        data: sellers
      };
    } catch (error) {
      console.error('Error fetching sellers:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to fetch sellers data');
    }
  }

  @Put('update/profile')
  @Roles(Role.SELLER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
      }),
    }),
  )
  async updateOwnSeller(
    @Body() dto: UpdateSellerDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (file) dto.fileName = file.filename;
    return this.sellerService.updateOwnSeller(req.user.sub, dto);
  }

  @Get('active/list')
  @Roles(Role.ADMIN)
  async getActiveSellers() {
    return this.sellerService.getActiveSellers();
  }

  @Get('me')
  @Roles(Role.SELLER)
  async getOwnProfile(@Request() req) {
    return this.sellerService.getSellerById(req.user.sub);
  }

  @Get('me/products')
  @Roles(Role.SELLER)
  async getOwnProducts(@Request() req) {
    return this.sellerService.getSellerProducts(req.user.sub);
  }

  @Get('me/orders')
  @Roles(Role.SELLER)
  async getOwnOrders(@Request() req) {
    return this.sellerService.getSellerOrders(req.user.sub);
  }
  
}
