import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersController } from "./order.controller";
import { OrdersService } from "./order.service";
import { OrderSchema } from "./schemas/order.schema";
import { DeliveryAddressSchema } from "../delivery-address/schemas/delivery-address.schema";
import { UserSchema } from "../user/schemas/user.schema";
import { Product, ProductSchema } from "../product/schemas/product.schema";

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Order', schema: OrderSchema },
        { name: 'DeliveryAddress', schema: DeliveryAddressSchema },
        { name: 'User', schema: UserSchema },
        { name: Product.name, schema: ProductSchema }
    ])],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrderModule {}