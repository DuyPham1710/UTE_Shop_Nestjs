import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVoucherDto } from './create-voucher.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
    @ApiProperty({
        description: 'Mã voucher (unique)',
        example: 'SUMMER2024',
        minLength: 3,
        maxLength: 20,
        required: false
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    code?: string;
}

