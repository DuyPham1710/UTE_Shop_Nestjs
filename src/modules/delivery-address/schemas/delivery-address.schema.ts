import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

@Schema({ timestamps: true, collection: 'delivery_addresses' })
export class DeliveryAddress extends Document {
  @Prop({ type: String, required: true })
  addressName: string;

  @Prop({ type: Boolean, default: false })
  defaultAddress: boolean;

  @Prop({ type: String, required: true })
  nameBuyer: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId | User;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String })
  note?: string;
}

export const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);
