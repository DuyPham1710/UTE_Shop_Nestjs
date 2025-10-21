import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Category } from './category.schema'
import { ProductImage } from './product-image.schema';

export type ProductDocument = HydratedDocument<Product>;
@Schema({ timestamps: true })
export class Product  {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ type: Types.ObjectId, ref: Category.name })
  category: Category | Types.ObjectId;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: ()=> ProductImage }] }) // ()=> ProductImage to avoid circular dependency
  images: Types.ObjectId[];


  @Prop({ unique: true })
  slug: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
