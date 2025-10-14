import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { User } from './schemas/user.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AppEvents } from 'src/shared/enums/app-events.enum';
import { plainToInstance } from 'class-transformer';
import UserResponseDto from './dto/user.response.dto';
import * as bcrypt from 'bcrypt';
import UpdateUserDto from './dto/update.user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findByUsername(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findOne(userId: string): Promise<UserResponseDto> {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new HttpException(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
        }
        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true
        });
    }

    async create(data: Partial<User>): Promise<UserDocument> {
        const newUser = new this.userModel(data);
        return newUser.save();
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.userModel.findByIdAndUpdate(
            userId,
            { refreshToken: hashedRefreshToken },
            { new: true } // trả về user đã cập nhật 
        );
    }

    async validateUserByEmail(email: string, password: string): Promise<UserResponseDto> {
        const user = await this.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const auth = await bcrypt.compare(password, user.password);

        if (!auth) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Your account is not activated. Please verify your email to activate your account');
        }

        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true
        });
    }

    async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new HttpException('Invalid userId', HttpStatus.BAD_REQUEST);
        }
        const userIdObject = new Types.ObjectId(userId);


        await this.userModel.findByIdAndUpdate(userIdObject, updateUserDto, { new: true });

        const user = await this.userModel.findById(userIdObject).exec();

        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true
        });
    }

    // ===== EVENT LISTENERS FOR AUTH =====
    @OnEvent(AppEvents.USER_FIND_BY_EMAIL)
    async handleFindByEmail({ email }: { email: string }): Promise<UserDocument | null> {
        return this.findByEmail(email);
    }

    @OnEvent(AppEvents.USER_FIND_BY_USERNAME)
    async handleFindByUsername({ username }: { username: string }): Promise<UserDocument | null> {
        return this.findByUsername(username);
    }

    @OnEvent(AppEvents.USER_CREATE)
    async handleCreate(data: Partial<User>): Promise<UserDocument> {
        return this.create(data);
    }

    @OnEvent(AppEvents.USER_UPDATE)
    async handleUpdate({ userId, updateData }: { userId: string, updateData: UpdateUserDto }): Promise<UserResponseDto> {
        return this.update(userId, updateData);
    }

    @OnEvent(AppEvents.USER_UPDATE_REFRESH_TOKEN)
    async handleUpdateRefreshToken({ userId, refreshToken }: { userId: string, refreshToken: string }): Promise<void> {
        return this.updateRefreshToken(userId, refreshToken);
    }

    @OnEvent(AppEvents.USER_VALIDATE_BY_EMAIL)
    async handleValidateByEmail({ email, password }: { email: string, password: string }): Promise<UserResponseDto | { error: string }> {
        try {
            return await this.validateUserByEmail(email, password);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                return { error: error.message };
            }
            return { error: 'Authentication failed' };
        }
    }

    @OnEvent(AppEvents.USER_FIND_ONE)
    async handleFindOne({ userId }: { userId: string }): Promise<UserResponseDto | { error: string }> {
        try {
            return await this.findOne(userId);
        } catch (error) {
            if (error instanceof HttpException) {
                return { error: error.message };
            }
            return { error: 'User not found' };
        }
    }
}
