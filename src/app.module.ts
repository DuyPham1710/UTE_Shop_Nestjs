import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { DeliveryAddressModule } from './modules/delivery-address/delivery-address.module';
import { MailModule } from './modules/mail/mail.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { VoucherModule } from './modules/voucher/voucher.module';


@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    MailModule,
    ProductModule,
    VoucherModule,
    OrderModule,
    DeliveryAddressModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
