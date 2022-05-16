import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/s3/s3.module';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from './entities/receipt.entity';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReceiptEntity,
      AuthEntity,
      CurrencyEntity,
      CompanyEntity,
      MemberEntity,
      SupplierEntity,
    ]),
    S3Module,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
