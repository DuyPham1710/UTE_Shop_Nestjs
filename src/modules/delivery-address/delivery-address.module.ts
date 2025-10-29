import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'DeliveryAddress', schema: './schemas/delivery-address.schema' },
        { name: 'User', schema:'../user/schemas/user.schema' }
    ])],
    controllers: [],
    providers: [],
    exports: [],
})
export class DeliveryAddressModule {}