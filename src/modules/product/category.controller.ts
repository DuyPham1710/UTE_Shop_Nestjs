import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // POST /categories
  @Post()
  async create(@Body() body: any) {
    try {
      const category = await this.categoryService.createCategory(body);
      return { success: true, data: category };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // GET /categories
  @Get()
  async list() {
    const categories = await this.categoryService.listCategories();
    return { success: true, data: categories };
  }

  // GET /categories/:slugOrId
  @Get(':slugOrId')
  async detail(@Param('slugOrId') slugOrId: string) {
    const category = await this.categoryService.getCategoryDetail(slugOrId);
    if (!category) return { success: false, message: 'Category not found' };
    return { success: true, data: category };
  }
}
