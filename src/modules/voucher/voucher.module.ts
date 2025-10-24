import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Voucher, VoucherSchema } from './schemas/voucher.schema';
import { UserVoucher, UserVoucherSchema } from './schemas/user-voucher.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Voucher.name, schema: VoucherSchema }, { name: UserVoucher.name, schema: UserVoucherSchema }])],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule { }
