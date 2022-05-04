import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    private configService: ConfigService,
  ) {}

  async getAllCurrency(id: string) {
    return await this.currencyRepository.find();
  }
  async getOneCurrency(id: string, currencyId: string) {
    const currency = await this.currencyRepository.findOne({
      where: { id: currencyId },
    });

    if (!currency) {
      throw new HttpException('Currency not found', HttpStatus.NOT_FOUND);
    }
    return currency;
  }
}
