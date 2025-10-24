import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategorySchema } from './schemas/category.schema';
import { ProductImageSchema } from './schemas/product-image.schema';
import { ProductSchema } from './schemas/product.schema';
import { ReviewSchema } from './schemas/review.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Product', schema: ProductSchema },
    { name: 'ProductImage', schema: ProductImageSchema },
    { name: 'Review', schema: ReviewSchema },
    { name: 'Category', schema: CategorySchema },
    { name: 'User', schema: UserSchema}
  ])],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService],
})
export class ProductModule {}
