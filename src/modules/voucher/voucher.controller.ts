import { Body, Controller, Get, Post, Put, Delete, Patch, Req, Param, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { AssignVoucherDto } from './dto/assign-voucher.dto';
import { VoucherResponseDto, PaginatedVoucherResponseDto, VoucherStatsResponseDto } from './dto/voucher-response.dto';

@ApiTags('Vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) { }

  // ============= USER ENDPOINTS =============

  @Get('my')
  @ApiOperation({ summary: 'Lấy danh sách voucher của user đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách voucher thành công' })
  getVouchersByUser(@Req() req: any) {
    return this.voucherService.getVouchersByUser(req.user.userId);
  }

  // ============= ADMIN ENDPOINTS =============

  @Post()
  @ApiOperation({ summary: '[ADMIN] Tạo voucher mới' })
  @ApiResponse({ status: 201, description: 'Tạo voucher thành công', type: VoucherResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Mã voucher đã tồn tại' })
  createVoucher(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.createVoucher(createVoucherDto);
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] Lấy danh sách tất cả vouchers với phân trang và filter' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách voucher thành công', type: PaginatedVoucherResponseDto })
  getAllVouchers(@Query() query: QueryVoucherDto) {
    return this.voucherService.getAllVouchers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Lấy chi tiết voucher theo ID' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Lấy thông tin voucher thành công', type: VoucherResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  getVoucherById(@Param('id') id: string) {
    return this.voucherService.getVoucherById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '[ADMIN] Cập nhật thông tin voucher' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật voucher thành công', type: VoucherResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  @ApiResponse({ status: 409, description: 'Mã voucher đã tồn tại' })
  updateVoucher(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto
  ) {
    return this.voucherService.updateVoucher(id, updateVoucherDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[ADMIN] Xóa voucher' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Xóa voucher thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa voucher đã được sử dụng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  deleteVoucher(@Param('id') id: string) {
    return this.voucherService.deleteVoucher(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: '[ADMIN] Gán voucher cho nhiều users' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Gán voucher thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher hoặc users' })
  assignVoucherToUsers(
    @Param('id') id: string,
    @Body() assignVoucherDto: AssignVoucherDto
  ) {
    return this.voucherService.assignVoucherToUsers(id, assignVoucherDto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '[ADMIN] Lấy thống kê sử dụng voucher' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công', type: VoucherStatsResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  getVoucherStats(@Param('id') id: string) {
    return this.voucherService.getVoucherStats(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: '[ADMIN] Chuyển đổi trạng thái công khai/riêng tư của voucher' })
  @ApiParam({ name: 'id', description: 'ID của voucher', type: String })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  toggleVoucherStatus(@Param('id') id: string) {
    return this.voucherService.toggleVoucherStatus(id);
  }
}
