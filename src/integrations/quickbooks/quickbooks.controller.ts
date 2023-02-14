import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { QUICKBOOKS_ROUTES, QUICKBOOKS_SWAGGER } from './quickbooks.constants';
import { QuickbooksService } from './quickbooks.service';

@ApiTags(QUICKBOOKS_SWAGGER.main)
@Controller(QUICKBOOKS_ROUTES.main)
export class QuickbooksController {
  constructor(private readonly quickBooksService: QuickbooksService) {}

  @Post(QUICKBOOKS_ROUTES.authorize)
  @ApiOperation({ summary: QUICKBOOKS_SWAGGER.authorize })
  @ApiResponse({
    status: HttpStatus.OK,
    description: QUICKBOOKS_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async authorizeUser() {
    return await this.quickBooksService.authorizeUser();
  }

  @Post(QUICKBOOKS_ROUTES.exchange_tokens)
  @ApiOperation({ summary: QUICKBOOKS_SWAGGER.exchange_tokens })
  @ApiResponse({
    status: HttpStatus.OK,
    description: QUICKBOOKS_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async exchangeTokens(@Body() body: { url: string }) {
    return await this.quickBooksService.exchangeTokens(body.url);
  }

  @Post(QUICKBOOKS_ROUTES.disconnect)
  @ApiOperation({ summary: QUICKBOOKS_SWAGGER.disconnect })
  @ApiResponse({
    status: HttpStatus.OK,
    description: QUICKBOOKS_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async revokeToken() {
    return await this.quickBooksService.revokeToken();
  }

  @Get('get-invoices')
  @ApiOperation({ summary: QUICKBOOKS_SWAGGER.disconnect })
  @ApiResponse({
    status: HttpStatus.OK,
    description: QUICKBOOKS_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllInvoices() {
    return await this.quickBooksService.getAllInvoices();
  }
}
