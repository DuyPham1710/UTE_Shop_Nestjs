import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop()
    phoneNumber?: string;

    @Prop({ type: Boolean, default: false })
    gender: boolean;

    @Prop({ type: Date })
    dateOfBirth?: Date;

    @Prop()
    avt?: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: Boolean, default: false })
    isActive: boolean;

    @Prop()
    otp?: string;

    @Prop({ type: Date, default: Date.now })
    otpGeneratedTime: Date;

    @Prop()
    refreshToken?: string;

    @Prop({ type: Number, default: 0 })
    xu: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
    viewedProducts?: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
    favProducts?: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
