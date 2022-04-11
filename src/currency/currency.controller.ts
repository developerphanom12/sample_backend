import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { USER_INFO_SWAGGER } from 'src/user-info/user-info.constants';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from './entities/currency.entity';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly CurrencyService: CurrencyService) {}

  @Get('get')
  @ApiOperation({ summary: 'get' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_INFO_SWAGGER.success,
    type: CurrencyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCurrency(@User('id') id: string) {
    return await this.CurrencyService.getCurrency(id);
  }
}
