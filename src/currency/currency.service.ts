import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { UserInfoEntity } from 'src/user-info/entities/user-info.entity';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async getAllCurrency(id: string) {
    return await this.currencyRepository.find();
  }
}
