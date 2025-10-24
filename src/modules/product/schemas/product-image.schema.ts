import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Product } from './product.schema';

export type ProductImageDocument = HydratedDocument<ProductImage>;
@Schema({ timestamps: true })
export class ProductImage {
  @Prop({ type: Types.ObjectId, ref: () => Product })
  product: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop()
  alt?: string; // mô tả alt cho SEO
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);
