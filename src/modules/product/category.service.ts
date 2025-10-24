import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(data: any) {
    try {
      const slug = slugify(data.name, { lower: true, strict: true });
      const newCategory = new this.categoryModel({ ...data, slug });
      return await newCategory.save();
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async listCategories() {
    return await this.categoryModel.find().sort({ createdAt: -1 });
  }

  async getCategoryDetail(idOrSlug: string) {
    return await this.categoryModel.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    });
  }
}
