import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { CompanyEntity } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrencyEntity,
      CompanyEntity,
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
