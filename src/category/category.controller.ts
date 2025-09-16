import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { Public } from '../auth/public.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Post()
  async create(@Body() categoryData: Partial<Category>): Promise<Category> {
    return this.categoryService.create(categoryData);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() categoryData: Partial<Category>,
  ): Promise<Category | null> {
    return this.categoryService.update(+id, categoryData);
  }

  @UseGuards(AuthGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(+id);
  }
}
