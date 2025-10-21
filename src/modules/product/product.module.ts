import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schemas/product.schema';
import { ProductImageSchema } from './schemas/product-image.schema';
import { ReviewSchema } from './schemas/review.schema';
import { CategorySchema } from './schemas/category.schema';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Product', schema: ProductSchema },
    { name: 'ProductImage', schema: ProductImageSchema },
    { name: 'Review', schema: ReviewSchema },
    { name: 'Category', schema: CategorySchema },
    { name: 'User', schema: UserSchema}
  ])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
