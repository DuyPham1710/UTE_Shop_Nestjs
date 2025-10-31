import { Body, Controller, Get, HttpStatus, Param, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query('status') status?: string) {
    const query: any = {};

    if (status) {
      switch (status) {
        case 'pending':
        case 'preparing':
        case 'cancelled':
          query.status = status;
          break;

        // Đang giao hàng (chưa giao cho người dùng)
        case 'delivering_false':
          query.status = 'delivering';
          query.isDelivered = false;
          break;

        // Đang giao, nhưng đã chuyển cho người dùng — chờ xác nhận
        case 'delivering_true':
          query.status = 'delivering';
          query.isDelivered = true;
          break;

        // Đã giao hoàn tất
        case 'delivered':
          query.status = 'delivered';
          break;

        default:
          break;
      }
    }

    const orders = await this.ordersService.getOrders(query);
    return {
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: { orders },
    };
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

  
  @Get('/stats/users')
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

  @Put(':orderId')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDto,
  ) {
    const { newStatusOrder } = body;

    const { updatedOrder, newStatusOrder: resultStatus } =
      await this.ordersService.updateOrderStatus(orderId, newStatusOrder);

    return {
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành ${resultStatus}`,
      data: updatedOrder,
    };
  }

}
