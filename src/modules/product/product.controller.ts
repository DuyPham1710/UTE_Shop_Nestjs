import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('top-viewed')
  async getTopViewedProducts() {
    return await this.productService.getTopViewedProducts();
  }

}
