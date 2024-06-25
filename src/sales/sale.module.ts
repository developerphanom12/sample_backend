import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { DownloadModule } from 'src/download/download.module';
import { EmailsModule } from 'src/emails/emails.module';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';
import { S3Module } from 'src/s3/s3.module';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { SalesEntity } from './entities/sale.entity';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesEntity,
      AuthEntity,
      CurrencyEntity,
      CompanyEntity,
      MemberEntity,
      SupplierEntity,
      CategoryEntity,
      PaymentTypeEntity,
    ]),
    S3Module,
    DownloadModule,
    EmailsModule,
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
