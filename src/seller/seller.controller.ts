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
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { AddSellerDto } from './add-seller.dto';
import { UpdateSellerDto } from './update-seller.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

 
  @Get()
  @UseGuards(AuthGuard)
  async getAllSellers(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.findAll();
  }

  
  @Get(':id')
  @UseGuards(AuthGuard)
  async getSellerById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.getSellerById(id);
  }


  @Post()
  @UseGuards(AuthGuard)
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
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    if (file) addSellerDto.fileName = file.filename;

    return this.sellerService.createSeller(addSellerDto, req.user.sub);
  }


  @Put(':id')
  @UseGuards(AuthGuard)
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
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    if (file) dto.fileName = file.filename;
    return this.sellerService.updateSeller(id, dto, req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  async changeSellerStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive',
    @Request() req,
  ) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.changeSellerStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteSeller(
  @Param('id', ParseIntPipe) id: number, 
  @Request() req
    ) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    await this.sellerService.deleteSeller(id, req.user.sub);
    return { 
    success: true,
    message: `Seller with id ${id} deleted successfully` 
    };
}

 @Get('search')
 @UseGuards(AuthGuard)
  async searchSellers(@Query('q') query: string, @Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.searchSeller(query ?? '');
}

  @Get('admin/mySellers')
  @UseGuards(AuthGuard)
  async getSellersByAdmin(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.getSellersByAdmin(req.user.sub);
  }


  @Put('update')
  @UseGuards(AuthGuard)
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
    if (req.user.role !== 'seller') throw new UnauthorizedException();
    if (file) dto.fileName = file.filename;
    return this.sellerService.updateOwnSeller(req.user.sub, dto);
  }

  @Get('active/list')
  @UseGuards(AuthGuard)
  async getActiveSellers(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.sellerService.getActiveSellers();
  }
  
}
