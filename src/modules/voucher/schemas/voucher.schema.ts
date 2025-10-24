import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: false, collection: 'vouchers' })
export class Voucher {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ required: true, enum: ['percentage', 'fixed'] })
    type: 'percentage' | 'fixed';

    @Prop({ required: true })
    discountValue: number;

    @Prop({ type: Date, default: Date.now })
    startDate: Date;

    @Prop({ type: Date, required: true })
    expiryDate: Date;

    @Prop({ type: Number, default: 0 })
    minOrderValue: number;

    @Prop({ type: Number, default: 0 }) // 0 = unlimited
    usageLimit: number;

    @Prop({ type: Boolean, default: true })
    isPublic: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
