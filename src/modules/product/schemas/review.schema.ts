import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { User } from 'src/modules/user/schemas/user.schema';

export type ReviewDocument = HydratedDocument<Review>;
@Schema({ timestamps: true })
export class Review  {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
  product: Product | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  user: User | Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop()
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
