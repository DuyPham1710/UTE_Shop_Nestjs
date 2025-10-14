import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsDateString
} from 'class-validator';
import { isValidAge } from 'src/common/utils/valid_age';

export default class UpdateUserDto {
    @ApiProperty({ example: 'Phạm Ngọc Duy' })
    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters' })
    @MaxLength(100, { message: 'Full name must be at most 100 characters' })
    @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
        message: 'Full name must contain only letters and spaces',
    })
    fullName?: string;

    @ApiProperty({ example: '0909090909', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, {
        message: 'Phone number format is invalid',
    })
    phoneNumber?: string;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    @Expose()
    @Transform(({ value }) => (value === undefined ? false : value))
    gender?: boolean;

    @ApiProperty({ example: '2000-01-01', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'Date of birth must be a valid date' })
    @isValidAge({ message: 'User must be between 13 and 120 years old' })
    dateOfBirth?: string;

    @ApiProperty({ example: 'avatar.png', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/, {
        message: 'Avatar must be a valid image file',
    })
    avt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    otp?: string;

    @IsOptional()
    @IsDate()
    otpGeneratedTime?: Date;
}
