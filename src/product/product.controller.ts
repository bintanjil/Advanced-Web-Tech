import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AddProductDto } from './add-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Public endpoint - anyone can view products
  @Public()
  @Get()
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  // Get product by ID - public
  @Public()
  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.getProductWithSeller(id);
  }

  // Seller endpoints - require authentication
  @Get('seller/myProducts')
  @UseGuards(AuthGuard)
  @Roles('seller')
  async getMyProducts(@Request() req) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Only sellers can access this endpoint');
    }
    return await this.productService.getProductsBySeller(req.user.sub);
  }

  @Post('add')
  @UseGuards(AuthGuard)
  @Roles('seller')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '_' + file.originalname);
        },
      }),
    }),
  )
  async addProduct(
    @Body() productDto: AddProductDto, 
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Only sellers can add products');
    }
    
    if (file) productDto.fileName = file.filename;
    return await this.productService.addProduct(productDto, req.user.sub);
  }

  @Put('seller/:id')
  @UseGuards(AuthGuard)
  @Roles('seller')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '_' + file.originalname);
        },
      }),
    }),
  )
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Only sellers can update products');
    }
    
    if (file) updateData.fileName = file.filename;
    return await this.productService.updateProduct(id, updateData, req.user.sub);
  }

  @Delete('seller/:id')
  @UseGuards(AuthGuard)
  @Roles('seller')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Only sellers can delete products');
    }
    
    return await this.productService.deleteProduct(id, req.user.sub);
  }

  @Patch(':id/discount')
  @UseGuards(AuthGuard)
  @Roles('seller')
  async applyDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body('discount') discount: number,
    @Request() req
  ) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Only sellers can apply discounts');
    }
    
    return await this.productService.applyDiscount(id, discount, req.user.sub);
  }
}