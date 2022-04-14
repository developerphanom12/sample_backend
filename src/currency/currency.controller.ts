import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { USER_INFO_SWAGGER } from 'src/user-info/user-info.constants';
import { CURRENCY_ROUTES, CURRENCY_SWAGGER } from './currency.constants';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from './entities/currency.entity';

@ApiTags(CURRENCY_ROUTES.main)
@Controller(CURRENCY_ROUTES.main)
export class CurrencyController {
  constructor(private readonly CurrencyService: CurrencyService) {}

  @Get(CURRENCY_ROUTES.get_all)
  @ApiOperation({ summary: CURRENCY_SWAGGER.get_all })
  @UseGuards(new JwtAuthenticationGuard())
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_INFO_SWAGGER.success,
    type: CurrencyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCurrency(@User('id') id: string) {
    return await this.CurrencyService.getAllCurrency(id);
  }
}
