import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserVoucherDocument = UserVoucher & Document;

@Schema({ collection: 'userVouchers' })
export class UserVoucher {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // khách hàng được gán voucher

    @Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
    voucherId: Types.ObjectId; // voucher áp dụng

    @Prop({ type: Number, default: 0 })
    usedCount: number; // số lần user đã dùng

    @Prop({ type: Number, default: 1 })
    maxUsagePerUser: number; // số lần tối đa user được dùng voucher này

    @Prop({ type: Date, default: Date.now })
    assignedDate: Date; // ngày gán voucher cho user
}

export const UserVoucherSchema = SchemaFactory.createForClass(UserVoucher);
