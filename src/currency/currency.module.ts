import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { UserInfoEntity } from '../user-info/entities/user-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrencyEntity,
      UserInfoEntity,
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
