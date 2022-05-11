import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

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
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
