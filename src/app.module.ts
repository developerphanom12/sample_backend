import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './shared/configs/database.config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core/constants';
import { HttpErrorFilter } from './shared/http-error.filter';
import { CurrencyModule } from './currency/currency.module';
import { AppController } from './app.controller'
import { ReceiptModule } from './receipt/receipt.module';
import { CompanyModule } from './company/company.module';
import { CompanyMemberModule } from './company-member/company-member.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SupplierModule } from './supplier/supplier.module';
import { CategoryController } from './category/category.controller';
import { CategoryModule } from './category/category.module';
import { PaymentTypeController } from './payment-type/payment-type.controller';
import { PaymentTypeModule } from './payment-type/payment-type.module';
import { S3Module } from './s3/s3.module';
import { DownloadModule } from './download/download.module';

const currentEnv = process.env.NODE_ENV || 'local';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${currentEnv}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    ScheduleModule.forRoot(),
    S3Module,
    DownloadModule,
    AuthModule,
    CurrencyModule,
    ReceiptModule,
    CompanyModule,
    CompanyMemberModule,
    DashboardModule,
    SupplierModule,
    CategoryModule,
    PaymentTypeModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
