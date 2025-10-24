import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './modules/mail/mail.module';
import { ProductModule } from './modules/product/product.module';
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
    VoucherModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
