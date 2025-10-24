import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsEnum,
    IsNumber,
    IsDate,
    IsOptional,
    IsBoolean,
    Min,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoucherDto {
    @ApiProperty({
        description: 'Mã voucher (unique)',
        example: 'SUMMER2024',
        minLength: 3,
        maxLength: 20
    })
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    code: string;

    @ApiProperty({
        description: 'Loại giảm giá',
        enum: ['percentage', 'fixed'],
        example: 'percentage'
    })
    @IsEnum(['percentage', 'fixed'])
    type: 'percentage' | 'fixed';

    @ApiProperty({
        description: 'Giá trị giảm (% hoặc số tiền cố định)',
        example: 20,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    discountValue: number;

    @ApiProperty({
        description: 'Ngày bắt đầu',
        example: '2024-01-01T00:00:00.000Z',
        required: false
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @ApiProperty({
        description: 'Ngày hết hạn',
        example: '2024-12-31T23:59:59.000Z'
    })
    @Type(() => Date)
    @IsDate()
    expiryDate: Date;

    @ApiProperty({
        description: 'Giá trị đơn hàng tối thiểu để áp dụng',
        example: 100000,
        required: false,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    @ApiProperty({
        description: 'Giới hạn số lần sử dụng (0 = không giới hạn)',
        example: 100,
        required: false,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    usageLimit?: number;

    @ApiProperty({
        description: 'Voucher công khai (true) hay riêng tư (false)',
        example: true,
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

