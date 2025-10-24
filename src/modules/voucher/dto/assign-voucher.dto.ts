import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class AssignVoucherDto {
    @ApiProperty({
        description: 'Danh sách user IDs được gán voucher',
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        type: [String]
    })
    @IsArray()
    @IsMongoId({ each: true })
    userIds: string[];

    @ApiProperty({
        description: 'Số lần tối đa mỗi user được sử dụng voucher này',
        example: 1,
        required: false,
        default: 1,
        minimum: 1
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxUsagePerUser?: number = 1;
}

