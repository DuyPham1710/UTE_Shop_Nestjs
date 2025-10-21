import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { isValidObjectId, Types } from 'mongoose';
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('top-viewed')
  async getTopViewedProducts() {
    return await this.productService.getTopViewedProducts();
  }

  @Post('create')
  async createProducts(@Body() productData: any) {
    const result = await this.productService.createProducts(productData);
    if (result.success) return { statusCode: 201, ...result };
    return { statusCode: 500, ...result };
  }

  @Get('top-discount')
  async getTopDiscountProducts() {
    const products = await this.productService.getTopDiscountProducts();
    return products;
  }
  
  @Get()
  async getProductsPerPage(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('category') category: string,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 5;

    const result = await this.productService.getProductPerPageService(
      pageNum,
      limitNum,
      category,
    );

    return result; // Nest tự set status 200 + JSON response
  }


  // 🆕 Lấy 8 sản phẩm mới nhất
  @Get('newest')
  async getNewestProducts() {
    const products = await this.productService.getNewestProducts();
    return {
      statusCode: 200,
      message: 'Newest products retrieved successfully',
      data: products,
    };
  }

  // 🏆 Lấy sản phẩm bán chạy nhất
  @Get('best-sellers')
  async getBestSellingProducts(@Query('limit') limit?: string) {
    const parsedLimit = parseInt(limit ?? '6');
    const products = await this.productService.getBestSellingProducts(parsedLimit);
    return {
      statusCode: 200,
      message: 'Best-selling products retrieved successfully',
      data: products,
    };
  }

  @Get(':productId/reviews')
  async getReviewsByProduct(@Param('productId') productId: string) {
    try {
      return await this.productService.getReviewsByProduct(productId);
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi server khi lấy review',
        error: error.message,
      };
    }
  }
  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product id');
    }
    const product = await this.productService.getProductDetail(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { success: true, data: product };
  }
  @Get(':id/similar')
  async getSimilarProducts(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product id');
    }

    const products = await this.productService.getSimilarProducts(id);

    if (!products || products.length === 0) {
      throw new NotFoundException('No similar products found');
    }

    return {
      statusCode: 200,
      message: 'Similar products retrieved successfully',
      data: products,
    };
  }

   
}
