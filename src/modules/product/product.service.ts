import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
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
    @InjectModel(ProductImage.name) private readonly imageModel: Model<ProductImage>,
  ) {}

    async createProducts(productData: any) {
    try {
      // Nếu body là mảng → insertMany
      if (Array.isArray(productData)) {
        const newProducts = await this.productModel.insertMany(productData);
        return {
          success: true,
          message: 'Products created successfully',
          products: newProducts,
        };
      }

      // Nếu body là object → tạo 1 sản phẩm
      const newProduct = new this.productModel(productData);
      await newProduct.save();

      return {
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      };
    } catch (error) {
      console.error('Error creating product(s):', error);
      return {
        success: false,
        message: 'Error creating product(s)',
        error: error.message,
      };
    }
  }

  // 🆕 Lấy 8 sản phẩm mới nhất
  async getNewestProducts() {
    const products = await this.productModel.aggregate([
      { $match: { status: 'available' } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
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
          createdAt: 1,
          'category.name': 1,
          images: 1,
        },
      },
    ]);

    return products;
  }

  // 🏆 Lấy sản phẩm bán chạy nhất
  async getBestSellingProducts(limit: number) {
    const products = await this.productModel.aggregate([
      { $match: { status: 'available' } },
      { $sort: { sold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
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
          createdAt: 1,
          'category.name': 1,
          images: 1,
        },
      },
    ]);

    return products;
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

  async getProductDetail(productId: string) {
    const product = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $inc: { views: 1 } },
        { new: true },
      )
      .populate('category', 'name description')
      .lean();

    if (!product) return null;

    const images = await this.productImageModel
      .find({ product: new mongoose.Types.ObjectId(productId) }) // Chuyển productId thành ObjectId, do circular dependency
      .select('url alt -_id')
      .lean();

    console.log('Images:', images);
      
    const reviews = await this.reviewModel
      .find({ product: productId }) // Lấy review theo productId, không cần chuyển đổi vì mongoose tự động xử lý do không circular dependency
      .populate('user', 'name email')
      .select('rating comment createdAt');

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return { ...product, images, reviews, avgRating };
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

   async getSimilarProducts(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const similarProducts = await this.productModel.aggregate([
      {
        $match: {
          category: new Types.ObjectId(product.category as any),
          _id: { $ne: product._id },
          status: 'available',
        },
      },
      { $limit: 6 },
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

    return similarProducts;
  }

  async getTopDiscountProducts() {
    try {
      const products = await this.productModel.aggregate([
        { $match: { status: 'available' } },
        {
          $addFields: {
            discountAmount: {
              $multiply: ['$price', { $divide: ['$discount', 100] }],
            },
          },
        },
        { $sort: { discountAmount: -1 } },
        { $limit: 4 },
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
            discountAmount: 1,
            sold: 1,
            views: 1,
            'category.name': 1,
            images: 1,
          },
        },
      ]);
      return products;
    } catch (error) {
      throw new Error(`Lỗi khi lấy top sản phẩm khuyến mãi: ${error.message}`);
    }
  }

    async getReviewsByProduct(productId: string) {
    try {
      const reviews = await this.reviewModel
        .find({ product: productId })
        .populate('user', 'fullName avt email') // lấy thêm thông tin user
        .sort({ createdAt: -1 })
        .exec();

      return reviews;
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }

  async getProductPerPageService(page = 1, limit = 5, category?: string) {
    try {
      const skip = (page - 1) * limit;
      const id = category?.split('-').pop(); // "66af270df88554d0fd490201"
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
      console.error('Error fetching products:', error);
      return { success: false, message: 'Error fetching products' };
    }
  }
}
