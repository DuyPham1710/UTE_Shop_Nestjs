import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { User } from '../user/schemas/user.schema';
import { Product } from '../product/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  
  async getOrders(query: any) {
    const filter: any = {};

    console.log(query);
    // Nếu có truyền status thì lọc theo statusOrder
    if (query.status) {
      filter.statusOrder = query.status;
    }

    // Nếu có truyền isDelivered thì lọc thêm
    if (query.isDelivered !== undefined) {
      // Ép kiểu boolean vì query là string ('true' / 'false')
      filter.isDelivered = query.isDelivered;
    }

    // Debug check
    console.log('Order filter:', filter);

    return this.orderModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'username email')
      .populate({
        path: 'items.product',
        select: 'name price discount images slug',
        populate: { path: 'images', select: 'url alt' },
      })
      .populate({
        path: 'deliveryAddressId',
        select: 'addressName nameBuyer phoneNumber defaultAddress note',
      });
  }



 async getRevenueStats({
    from,
    to,
    groupBy = 'day',
  }: {
    from?: string;
    to?: string;
    groupBy?: string;
  }) {
    const fromDate = from ? new Date(from) : new Date('1970-01-01');
    const toDate = to ? new Date(to) : new Date();

    console.log('=== 📥 [getRevenueStats] INPUT ===');
    console.log('From:', from);
    console.log('To:', to);
    console.log('GroupBy:', groupBy);
    console.log('Converted Date Range:', { fromDate, toDate });

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

    console.log('=== 📊 [getRevenueStats] RAW AGGREGATION RESULT ===');
    console.table(stats);

    const mappedStats = stats.map((s) => ({
      date: s._id,
      revenue: s.totalRevenue,
      orders: s.count,
    }));

    console.log('=== ✅ [getRevenueStats] FINAL RESPONSE ===');
    console.table(mappedStats);

    return mappedStats;
  }
   async getNewUsersStats({ from, to, groupBy = 'day' }: { from?: string; to?: string; groupBy?: string }) {
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

    const stats = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stats.map((s) => ({
      date: s._id,
      users: s.newUsers,
    }));
  }
  async updateOrderStatus(orderId: string, newStatusOrder: Order['statusOrder']) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel
      .findById(orderId)
      .populate('items.product');

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Nếu admin chọn hủy
    if (newStatusOrder === 'cancelled' && order.statusOrder !== 'cancelled') {
      if (order.status === 'paid') {
        const user = await this.userModel.findById(order.user);
        if (user) {
          user.xu = (user.xu || 0) + order.totalPrice + (order.usedXu || 0);
          await user.save();
        }
      }

      // hoàn lại tồn kho
      await Promise.all(
        order.items.map((item: any) =>
          this.productModel.findByIdAndUpdate(item.product._id, {
            $inc: { quantity: item.quantity },
          }),
        ),
      );
    }

    // Nếu admin chọn giao hàng
    if (newStatusOrder === 'delivered') {
      order.isDelivered = true; // đã giao cho đơn vị vận chuyển
      order.statusOrder = 'delivering';
      order.autoUpdate = new Date(Date.now() + 3 * 60 * 1000);
    } else {
      order.statusOrder = newStatusOrder;
    }

    await order.save();

    return { updatedOrder: order, newStatusOrder };
  }

}
