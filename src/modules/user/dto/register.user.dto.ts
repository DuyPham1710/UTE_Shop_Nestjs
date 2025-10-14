import { ApiProperty } from "@nestjs/swagger";
import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
    registerDecorator,
    ValidationArguments,
    ValidationOptions
} from "class-validator";
import { Match } from "src/common/decorators/match.decorator";
import { Expose, Transform } from "class-transformer";
import { isValidAge } from "src/common/utils/valid_age";

export default class RegisterUserDto {
    @ApiProperty({ example: 'Phạm Ngọc Duy' })
    @IsString()
    @IsNotEmpty({ message: 'Full name is required' })
    @MinLength(2, { message: 'Full name must be at least 2 characters' })
    @MaxLength(100, { message: 'Full name must be at most 100 characters' })
    @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
        message: 'Full name must contain only letters and spaces',
    })
    fullName: string;

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

    @ApiProperty({ example: 'duy@gmail.com' })
    @IsEmail({}, { message: 'Email format is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'duynguyen' })
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must be at most 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty({ example: 'Password@123' })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(128, { message: 'Password must be at most 128 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
        message:
            'Password must include uppercase, lowercase, number, and special character',
    })
    password: string;

    @ApiProperty({ example: 'Password@123' })
    @IsString()
    @IsNotEmpty({ message: 'Confirm password is required' })
    @Match('password', { message: 'Password and confirm password must match' })
    confirmPassword: string;
}