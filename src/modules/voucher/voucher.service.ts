import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvents } from 'src/shared/enums/app-events.enum';
import { UserVoucher, UserVoucherDocument } from './schemas/user-voucher.schema';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { AssignVoucherDto } from './dto/assign-voucher.dto';
import { PaginatedVoucherResponseDto, VoucherResponseDto } from './dto';

@Injectable()
export class VoucherService {
    constructor(
        @InjectModel(Voucher.name) private readonly voucherModel: Model<VoucherDocument>,
        @InjectModel(UserVoucher.name) private readonly userVoucherModel: Model<UserVoucherDocument>,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async getVouchersByUser(userId: string) {
        try {
            const [user] = await this.eventEmitter.emitAsync(AppEvents.USER_FIND_ONE, {
                userId: userId
            });

            const userXu = user.xu || 0;
            const userVouchers = await this.userVoucherModel
                .find({ userId: new Types.ObjectId(userId) })
                .populate({ path: 'voucherId', model: 'Voucher' })
                .lean();

            const vouchers = userVouchers
                .filter((uv) => uv.voucherId && typeof uv.voucherId === 'object') // bỏ voucher null
                .map((uv) => ({
                    ...uv.voucherId,
                    usedCount: uv.usedCount,
                    maxUsagePerUser: uv.maxUsagePerUser,
                    assignedDate: uv.assignedDate,
                }));

            return {
                success: true,
                vouchers,
                xu: userXu,
            };
        } catch (error) {
            console.error('getVouchersByUser error:', error);
            throw new InternalServerErrorException('Server error');
        }
    }

    // ============= ADMIN METHODS =============

    /**
     * Tạo voucher mới
     */
    async createVoucher(createVoucherDto: CreateVoucherDto) {
        try {
            // Validate expiry date
            if (createVoucherDto.expiryDate <= new Date()) {
                throw new BadRequestException('Ngày hết hạn phải lớn hơn ngày hiện tại');
            }

            // Validate discount value for percentage type
            if (createVoucherDto.type === 'percentage' && createVoucherDto.discountValue > 100) {
                throw new BadRequestException('Giá trị giảm giá phần trăm không được vượt quá 100%');
            }

            // Check if voucher code already exists
            const existingVoucher = await this.voucherModel.findOne({
                code: createVoucherDto.code.toUpperCase()
            });

            if (existingVoucher) {
                throw new ConflictException('Mã voucher đã tồn tại');
            }

            // Create voucher
            const voucher = await this.voucherModel.create({
                ...createVoucherDto,
                code: createVoucherDto.code.toUpperCase(),
                startDate: createVoucherDto.startDate || new Date(),
            });

            // Return voucher in correct format
            const response: VoucherResponseDto = {
                _id: (voucher as any)._id.toString(),
                code: voucher.code,
                type: voucher.type,
                discountValue: voucher.discountValue,
                startDate: voucher.startDate,
                expiryDate: voucher.expiryDate,
                minOrderValue: voucher.minOrderValue,
                usageLimit: voucher.usageLimit,
                isPublic: voucher.isPublic,
                createdAt: (voucher as any).createdAt || voucher.startDate,
                updatedAt: (voucher as any).updatedAt || voucher.startDate,
                usedCount: 0,
                status: this.getVoucherStatus(voucher),
            };

            return response;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            console.error('createVoucher error:', error);
            throw new InternalServerErrorException('Lỗi khi tạo voucher');
        }
    }

    /**
     * Lấy tất cả vouchers với phân trang và filter
     */
    async getAllVouchers(query: QueryVoucherDto): Promise<PaginatedVoucherResponseDto> {
        try {
            const { page = 1, limit = 10, search, type, isPublic, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

            const skip = (page - 1) * limit;
            const filter: any = {};

            // Search by code
            if (search) {
                filter.code = { $regex: search, $options: 'i' };
            }

            // Filter by type
            if (type) {
                filter.type = type;
            }

            // Filter by isPublic
            if (isPublic !== undefined) {
                filter.isPublic = isPublic;
            }

            // Filter by status
            const now = new Date();
            if (status === 'active') {
                filter.startDate = { $lte: now };
                filter.expiryDate = { $gte: now };
            } else if (status === 'expired') {
                filter.expiryDate = { $lt: now };
            } else if (status === 'upcoming') {
                filter.startDate = { $gt: now };
            }

            // Get vouchers with pagination
            const [vouchers, total] = await Promise.all([
                this.voucherModel
                    .find(filter)
                    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.voucherModel.countDocuments(filter),
            ]);

            // Add status and usedCount to each voucher
            const vouchersWithStats: VoucherResponseDto[] = await Promise.all(
                vouchers.map(async (voucher) => {
                    const usedCount = await this.userVoucherModel.aggregate([
                        { $match: { voucherId: voucher._id } },
                        { $group: { _id: null, total: { $sum: '$usedCount' } } },
                    ]);

                    return {
                        _id: voucher._id.toString(),
                        code: voucher.code,
                        type: voucher.type,
                        discountValue: voucher.discountValue,
                        startDate: voucher.startDate,
                        expiryDate: voucher.expiryDate,
                        minOrderValue: voucher.minOrderValue,
                        usageLimit: voucher.usageLimit,
                        isPublic: voucher.isPublic,
                        usedCount: usedCount[0]?.total || 0,
                        status: this.getVoucherStatus(voucher),
                    };
                })
            );

            const response: PaginatedVoucherResponseDto = {
                data: vouchersWithStats,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };

            return response;
        } catch (error) {
            console.error('getAllVouchers error:', error);
            throw new InternalServerErrorException('Lỗi khi lấy danh sách voucher');
        }
    }

    /**
     * Lấy chi tiết voucher theo ID
     */
    async getVoucherById(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(id).lean();

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            // Get usage statistics
            const usedCount = await this.userVoucherModel.aggregate([
                { $match: { voucherId: new Types.ObjectId(id) } },
                { $group: { _id: null, total: { $sum: '$usedCount' } } },
            ]);

            const totalAssigned = await this.userVoucherModel.countDocuments({
                voucherId: new Types.ObjectId(id),
            });

            return {
                success: true,
                data: {
                    ...voucher,
                    usedCount: usedCount[0]?.total || 0,
                    totalAssigned,
                    status: this.getVoucherStatus(voucher),
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('getVoucherById error:', error);
            throw new InternalServerErrorException('Lỗi khi lấy thông tin voucher');
        }
    }

    /**
     * Cập nhật voucher
     */
    async updateVoucher(id: string, updateVoucherDto: UpdateVoucherDto) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(id);

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            // Validate expiry date
            if (updateVoucherDto.expiryDate && updateVoucherDto.expiryDate <= new Date()) {
                throw new BadRequestException('Ngày hết hạn phải lớn hơn ngày hiện tại');
            }

            // Validate discount value for percentage type
            const type = updateVoucherDto.type || voucher.type;
            const discountValue = updateVoucherDto.discountValue || voucher.discountValue;

            if (type === 'percentage' && discountValue > 100) {
                throw new BadRequestException('Giá trị giảm giá phần trăm không được vượt quá 100%');
            }

            // Check if new code already exists
            if (updateVoucherDto.code && updateVoucherDto.code.toUpperCase() !== voucher.code) {
                const existingVoucher = await this.voucherModel.findOne({
                    code: updateVoucherDto.code.toUpperCase(),
                    _id: { $ne: id }
                });

                if (existingVoucher) {
                    throw new ConflictException('Mã voucher đã tồn tại');
                }

                updateVoucherDto.code = updateVoucherDto.code.toUpperCase();
            }

            // Update voucher
            const updatedVoucher = await this.voucherModel.findByIdAndUpdate(
                id,
                updateVoucherDto,
                { new: true }
            );

            return {
                success: true,
                message: 'Cập nhật voucher thành công',
                data: updatedVoucher,
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error('updateVoucher error:', error);
            throw new InternalServerErrorException('Lỗi khi cập nhật voucher');
        }
    }

    /**
     * Xóa voucher
     */
    async deleteVoucher(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(id);

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            // Check if voucher is being used
            const isUsed = await this.userVoucherModel.exists({
                voucherId: new Types.ObjectId(id),
                usedCount: { $gt: 0 }
            });

            if (isUsed) {
                throw new BadRequestException('Không thể xóa voucher đã được sử dụng');
            }

            // Delete voucher and related user-voucher assignments
            await Promise.all([
                this.voucherModel.findByIdAndDelete(id),
                this.userVoucherModel.deleteMany({ voucherId: new Types.ObjectId(id) }),
            ]);

            return {
                success: true,
                message: 'Xóa voucher thành công',
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('deleteVoucher error:', error);
            throw new InternalServerErrorException('Lỗi khi xóa voucher');
        }
    }

    /**
     * Gán voucher cho users
     */
    async assignVoucherToUsers(voucherId: string, assignVoucherDto: AssignVoucherDto) {
        try {
            if (!Types.ObjectId.isValid(voucherId)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(voucherId);

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            const { userIds, maxUsagePerUser = 1 } = assignVoucherDto;

            // Validate all user IDs
            for (const userId of userIds) {
                if (!Types.ObjectId.isValid(userId)) {
                    throw new BadRequestException(`User ID không hợp lệ: ${userId}`);
                }
            }

            // Verify all users exist
            const [users] = await this.eventEmitter.emitAsync(AppEvents.USER_FIND_MANY, {
                userIds: userIds
            });

            if (users.length !== userIds.length) {
                throw new BadRequestException('Một hoặc nhiều user không tồn tại');
            }

            // Assign voucher to users
            const assignments = userIds.map(userId => ({
                userId: new Types.ObjectId(userId),
                voucherId: new Types.ObjectId(voucherId),
                maxUsagePerUser,
                usedCount: 0,
                assignedDate: new Date(),
            }));

            // Use bulkWrite to handle duplicates
            const bulkOps = assignments.map(assignment => ({
                updateOne: {
                    filter: {
                        userId: assignment.userId,
                        voucherId: assignment.voucherId
                    },
                    update: {
                        $set: { maxUsagePerUser: assignment.maxUsagePerUser },
                        $setOnInsert: {
                            usedCount: 0,
                            assignedDate: assignment.assignedDate
                        }
                    },
                    upsert: true,
                },
            }));

            await this.userVoucherModel.bulkWrite(bulkOps);

            return {
                success: true,
                message: `Đã gán voucher cho ${userIds.length} user(s) thành công`,
                data: {
                    voucherId,
                    totalAssigned: userIds.length,
                    maxUsagePerUser,
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('assignVoucherToUsers error:', error);
            throw new InternalServerErrorException('Lỗi khi gán voucher cho users');
        }
    }

    /**
     * Lấy thống kê sử dụng voucher
     */
    async getVoucherStats(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(id).lean();

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            // Get usage statistics
            const [usedStats, totalAssigned, totalUsedByUsers] = await Promise.all([
                this.userVoucherModel.aggregate([
                    { $match: { voucherId: new Types.ObjectId(id) } },
                    { $group: { _id: null, total: { $sum: '$usedCount' } } },
                ]),
                this.userVoucherModel.countDocuments({ voucherId: new Types.ObjectId(id) }),
                this.userVoucherModel.countDocuments({
                    voucherId: new Types.ObjectId(id),
                    usedCount: { $gt: 0 }
                }),
            ]);

            const totalUsed = usedStats[0]?.total || 0;
            const remainingUsage = voucher.usageLimit === 0 ? 0 : Math.max(0, voucher.usageLimit - totalUsed);

            return {
                success: true,
                data: {
                    voucherId: id,
                    code: voucher.code,
                    totalUsed,
                    totalAssigned,
                    totalUsedByUsers,
                    usageLimit: voucher.usageLimit,
                    remainingUsage,
                    status: this.getVoucherStatus(voucher),
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('getVoucherStats error:', error);
            throw new InternalServerErrorException('Lỗi khi lấy thống kê voucher');
        }
    }

    /**
     * Toggle public status của voucher
     */
    async toggleVoucherStatus(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('ID voucher không hợp lệ');
            }

            const voucher = await this.voucherModel.findById(id);

            if (!voucher) {
                throw new NotFoundException('Không tìm thấy voucher');
            }

            voucher.isPublic = !voucher.isPublic;
            await voucher.save();

            return {
                success: true,
                message: `Voucher đã được ${voucher.isPublic ? 'công khai' : 'ẩn'}`,
                data: {
                    isPublic: voucher.isPublic,
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('toggleVoucherStatus error:', error);
            throw new InternalServerErrorException('Lỗi khi thay đổi trạng thái voucher');
        }
    }

    /**
     * Helper: Get voucher status
     */
    private getVoucherStatus(voucher: any): 'active' | 'expired' | 'upcoming' {
        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const expiryDate = new Date(voucher.expiryDate);

        if (now < startDate) {
            return 'upcoming';
        } else if (now > expiryDate) {
            return 'expired';
        } else {
            return 'active';
        }
    }
}
