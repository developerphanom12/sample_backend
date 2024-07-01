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
import { ExpenseEntity } from './entities/expense.entity';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { ExpenseReceiptEntity } from './entities/expense-receipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpenseEntity,
      AuthEntity,
      CurrencyEntity,
      CompanyEntity,
      MemberEntity,
      SupplierEntity,
      CategoryEntity,
      PaymentTypeEntity,
      ReceiptEntity,
      ExpenseReceiptEntity
    ]),
    S3Module,
    DownloadModule,
    EmailsModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
