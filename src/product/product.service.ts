import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { AddProductDto } from './add-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { SellerService } from '../seller/seller.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly sellerService: SellerService,
  ) {}

  private async verifySellerOwnership(productId: number, sellerId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.seller.id !== sellerId) {
      throw new ForbiddenException('You can only modify your own products');
    }

    return product;
  }

  async addProduct(productDto: AddProductDto, sellerId: number): Promise<Product> {
    const seller = await this.sellerService.getSellerById(sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller not found with ID ${sellerId}`);
    }

    const product = this.productRepository.create({
      ...productDto,
      seller
    });

    const savedProduct = await this.productRepository.save(product);
    return this.getProductWithSeller(savedProduct.id);
  }

  async updateProduct(id: number, updateData: UpdateProductDto, sellerId: number): Promise<Product> {
    const product = await this.verifySellerOwnership(id, sellerId);
    Object.assign(product, updateData);
    await this.productRepository.save(product);
    return this.getProductWithSeller(id);
  }

  async deleteProduct(id: number, sellerId: number): Promise<void> {
    await this.verifySellerOwnership(id, sellerId);
    await this.productRepository.delete(id);
  }

  async applyDiscount(id: number, discount: number, sellerId: number): Promise<Product> {
    if (discount < 0 || discount > 100) {
      throw new ForbiddenException('Discount must be between 0 and 100');
    }

    const product = await this.verifySellerOwnership(id, sellerId);
    product.discount = discount;
    await this.productRepository.save(product);
    return this.getProductWithSeller(id);
  }

  async getProductWithSeller(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['seller']
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { seller: { id: sellerId } },
      relations: ['seller']
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['seller']
    });
  }
}