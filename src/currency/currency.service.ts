import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CURRENCY_ERRORS } from './currency.errors';
import { CurrencyEntity } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    private configService: ConfigService,
  ) {}

  async getAllCurrency(): Promise<CurrencyEntity[]> {
    return await this.currencyRepository.find();
  }
  async getOneCurrency(
    id: string,
    currencyId: string,
  ): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findOne({
      where: { id: currencyId },
    });

    if (!currency) {
      throw new HttpException(CURRENCY_ERRORS.currency, HttpStatus.NOT_FOUND);
    }
    return currency;
  }
}
