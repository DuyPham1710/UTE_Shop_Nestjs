// src/modules/admin-order/dto/update-order.dto.ts
import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['pending', 'preparing', 'delivering', 'delivered', 'cancelled'])
  newStatusOrder: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
}
