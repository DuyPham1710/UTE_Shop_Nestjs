import { ApiProperty } from '@nestjs/swagger';

export class VoucherResponseDto {
    @ApiProperty({ description: 'ID của voucher' })
    _id: string;

    @ApiProperty({ description: 'Mã voucher' })
    code: string;

    @ApiProperty({ description: 'Loại giảm giá', enum: ['percentage', 'fixed'] })
    type: 'percentage' | 'fixed';

    @ApiProperty({ description: 'Giá trị giảm' })
    discountValue: number;

    @ApiProperty({ description: 'Ngày bắt đầu' })
    startDate: Date;

    @ApiProperty({ description: 'Ngày hết hạn' })
    expiryDate: Date;

    @ApiProperty({ description: 'Giá trị đơn hàng tối thiểu' })
    minOrderValue: number;

    @ApiProperty({ description: 'Giới hạn số lần sử dụng' })
    usageLimit: number;

    @ApiProperty({ description: 'Voucher công khai hay không' })
    isPublic: boolean;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt?: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt?: Date;

    @ApiProperty({ description: 'Số lần đã sử dụng', required: false })
    usedCount?: number;

    @ApiProperty({ description: 'Trạng thái voucher', enum: ['active', 'expired', 'upcoming'] })
    status?: 'active' | 'expired' | 'upcoming';
}

export class PaginatedVoucherResponseDto {
    @ApiProperty({ type: [VoucherResponseDto] })
    data: VoucherResponseDto[];

    @ApiProperty({ description: 'Tổng số vouchers' })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại' })
    page: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang' })
    totalPages: number;
}

export class VoucherStatsResponseDto {
    @ApiProperty({ description: 'ID của voucher' })
    voucherId: string;

    @ApiProperty({ description: 'Mã voucher' })
    code: string;

    @ApiProperty({ description: 'Tổng số lần đã sử dụng' })
    totalUsed: number;

    @ApiProperty({ description: 'Số lượng users đã được gán' })
    totalAssigned: number;

    @ApiProperty({ description: 'Số lượng users đã sử dụng' })
    totalUsedByUsers: number;

    @ApiProperty({ description: 'Giới hạn sử dụng' })
    usageLimit: number;

    @ApiProperty({ description: 'Số lần còn lại có thể sử dụng (0 = không giới hạn)' })
    remainingUsage: number;

    @ApiProperty({ description: 'Trạng thái', enum: ['active', 'expired', 'upcoming'] })
    status: 'active' | 'expired' | 'upcoming';
}

