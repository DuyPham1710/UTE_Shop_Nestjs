import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVoucherDto {
    @ApiProperty({
        description: 'Số trang',
        example: 1,
        required: false,
        default: 1,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Số lượng mỗi trang',
        example: 10,
        required: false,
        default: 10,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({
        description: 'Tìm kiếm theo mã voucher',
        example: 'SUMMER',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Lọc theo loại voucher',
        enum: ['percentage', 'fixed'],
        required: false
    })
    @IsOptional()
    @IsEnum(['percentage', 'fixed'])
    type?: 'percentage' | 'fixed';

    @ApiProperty({
        description: 'Lọc voucher công khai/riêng tư',
        example: true,
        required: false
    })

    @IsOptional()
    isPublic?: boolean;

    @ApiProperty({
        description: 'Lọc theo trạng thái (active/expired/upcoming)',
        enum: ['active', 'expired', 'upcoming'],
        required: false
    })
    @IsOptional()
    @IsEnum(['active', 'expired', 'upcoming'])
    status?: 'active' | 'expired' | 'upcoming';

    @ApiProperty({
        description: 'Sắp xếp theo trường',
        example: 'createdAt',
        required: false,
        default: 'createdAt'
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: ['asc', 'desc'],
        example: 'desc',
        required: false,
        default: 'desc'
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

