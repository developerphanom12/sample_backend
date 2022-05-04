import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyEntity } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      MemberEntity,
      ReceiptEntity,
      AuthEntity,
      CurrencyEntity,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
