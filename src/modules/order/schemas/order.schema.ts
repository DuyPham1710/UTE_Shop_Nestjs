import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { DeliveryAddress } from 'src/modules/delivery-address/schemas/delivery-address.schema';
import { Product } from 'src/modules/product/schemas/product.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { Voucher } from 'src/modules/voucher/schemas/voucher.schema';


export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop([
    {
      product: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      isCommented: { type: Boolean, default: false },
    },
  ])
  items: {
    product: Types.ObjectId | Product;
    quantity: number;
    isCommented: boolean;
  }[];

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'failed';

  @Prop({
    type: String,
    enum: ['pending', 'preparing', 'delivering', 'delivered', 'cancelled'],
    default: 'pending',
  })
  statusOrder:
    | 'pending'
    | 'preparing'
    | 'delivering'
    | 'delivered'
    | 'cancelled';

  @Prop({ type: Boolean, default: false })
  isDelivered: boolean;

  // @Prop({ type: String, required: true })
  // address: string;

  // @Prop({ type: String, required: true })
  // phone: string;

  // @Prop({ type: String, required: true })
  // name: string;

  // @Prop()
  // note: string;

  @Prop({ type: Object })
  paymentInfo: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Voucher' })
  voucher?: Types.ObjectId | Voucher;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: Number, default: 0 })
  usedXu: number;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryAddress', required: true })
  deliveryAddressId: Types.ObjectId | DeliveryAddress;

  @Prop({ type: Date, default: null })
  autoUpdate: Date | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
