import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  // === Hàm thay cho AdminOrderService.getOrders() ===
  async getOrders({ status, isDelivered }: { status?: string; isDelivered?: boolean }) {
    const filter: any = {};

    if (status) {
      filter.statusOrder = status;
    }

    if (isDelivered !== undefined) {
      filter.isDelivered = isDelivered;
    }

    console.log('Filter:', filter);

    return await this.orderModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'username email');
  }

  // === Logic chính của route /admin/orders ===
  async getOrderStatusByAdmin(status?: string) {
    let query: any = {};
    if (status) query.status = status;
    if (query.status === 'delivering') query.isDelivered = false;
    if (query.status === 'delivered') {
      query.status = 'delivering';
      query.isDelivered = true;
    }
    if (query.status === 'completed') query.status = 'delivered';

    const orders = await this.getOrders({
      status: query.status,
      isDelivered: query.isDelivered,
    });

    if (!orders || orders.length === 0) return [];

    // Populate thêm sản phẩm và địa chỉ giao hàng
    await Promise.all(
      orders.map((order) =>
        order.populate([
          {
            path: 'items.product',
            select: 'name price discount images slug',
            populate: { path: 'images', select: 'url alt' },
          },
          {
            path: 'deliveryAddressId',
            select: 'addressName nameBuyer phoneNumber defaultAddress note',
          },
        ]),
      ),
    );

    return orders;
  }

  async getRevenueStats({ from, to, groupBy = 'day' }: { from?: string; to?: string; groupBy?: string }) {
    const fromDate = from ? new Date(from) : new Date('1970-01-01');
    const toDate = to ? new Date(to) : new Date();

    let dateFormat: string;
    if (groupBy === 'day') {
      dateFormat = '%Y-%m-%d';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    } else {
      throw new BadRequestException("Invalid groupBy. Use 'day' or 'month'.");
    }

    const stats = await this.orderModel.aggregate([
      {
        $match: {
          statusOrder: 'delivered',
          updatedAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$updatedAt' } },
          totalRevenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stats.map((s) => ({
      date: s._id,
      revenue: s.totalRevenue,
      orders: s.count,
    }));
  }
}
