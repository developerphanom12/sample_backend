import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
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
    ]),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
