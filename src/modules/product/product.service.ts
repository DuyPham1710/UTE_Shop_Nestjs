import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { ProductImage } from './schemas/product-image.schema';
import { Product } from './schemas/product.schema';
import { Review } from './schemas/review.schema'; // nếu bạn có schema review

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(ProductImage.name) private readonly productImageModel: Model<ProductImage>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  // 🧱 Create one or multiple products
  async createProduct(productData: any): Promise<any> {
    try {
      if (Array.isArray(productData)) {
        const newProducts = await this.productModel.insertMany(productData);
        return {
          success: true,
          message: 'Products created successfully',
          products: newProducts,
        };
      } else {
        const newProduct = new this.productModel(productData);
        await newProduct.save();
        return {
          success: true,
          message: 'Product created successfully',
          product: newProduct,
        };
      }
    } catch (error) {
      this.logger.error('Error creating product(s)', error);
      return { success: false, message: 'Error creating product(s)' };
    }
  }

  // 🔍 Get product by ID
  async getProductById(productId: string): Promise<any> {
    try {
      const product = await this.productModel
        .findById(productId)
        .populate('category')
        .populate('images')
        .exec();

      if (!product) {
        return { success: false, message: 'Product not found' };
      }
      return { success: true, product };
    } catch (error) {
      this.logger.error('Error fetching product', error);
      return { success: false, message: 'Error fetching product' };
    }
  }

  // 📄 Get products by page
  async getProductPerPage(page = 1, limit = 5, category?: string): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const id = category?.split('-').pop();
      const filter = id ? { category: new Types.ObjectId(id) } : {};

      const products = await this.productModel
        .find(filter)
        .populate({
          path: 'images',
          model: this.productImageModel,
          select: 'url alt -_id',
        })
        .populate('category', 'name slug')
        .skip(skip)
        .limit(limit)
        .lean();

      const totalProducts = await this.productModel.countDocuments(filter);

      return {
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching products', error);
      return { success: false, message: 'Error fetching products' };
    }
  }

  // 📊 Get product detail + increment views
  async getProductDetail(productId: string): Promise<any> {
    try {
      const product = await this.productModel
        .findByIdAndUpdate(
          productId,
          { $inc: { views: 1 } },
          { new: true },
        )
        .populate('category', 'name description')
        .lean();

      if (!product) return null;

      // Lấy danh sách hình ảnh
      const images = await this.productImageModel
        .find({ product: productId })
        .select('url alt -_id');

      // Lấy đánh giá sản phẩm
      const reviews = await this.reviewModel
        .find({ product: productId })
        .populate('user', 'name email')
        .select('rating comment createdAt');

      const avgRating =
        reviews.length > 0
          ? (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
          : null;

      return { ...product, images, reviews, avgRating };
    } catch (error) {
      this.logger.error('Error fetching product detail', error);
      return null;
    }
  }
  // 🔥 Get top viewed products 
  async getTopViewedProducts() {
    try {
      const products = await this.productModel.aggregate([
        { $match: { status: 'available' } },
        { $sort: { views: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $lookup: {
            from: 'productimages',
            localField: '_id',
            foreignField: 'product',
            as: 'images',
          },
        },
        {
          $project: {
            name: 1,
            price: 1,
            discount: 1,
            sold: 1,
            views: 1,
            'category.name': 1,
            images: 1,
          },
        },
      ]);

      return { success: true, data: products };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi server' };
    }
  }
}
