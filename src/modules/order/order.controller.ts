import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './order.service';

@Controller('admin')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrderStatusByAdmin(@Query('orders/status') status: string, @Res() res: Response) {
    try {
      const orders = await this.ordersService.getOrderStatusByAdmin(status);

      if (!orders || orders.length === 0) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'Không tìm thấy đơn hàng',
          data: { orders: [] },
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: { orders },
      });
    } catch (error) {
      console.error('Get Orders Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  }

  @Get('/stats/revenue')
  async getRevenueStats(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('groupBy') groupBy: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.ordersService.getRevenueStats({ from, to, groupBy });
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  
  @Get('stats/users')
  async getNewUsers(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy: 'day' | 'month' = 'day',
  ) {
    try {
      const data = await this.ordersService.getNewUsersStats({ from, to, groupBy });
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}
