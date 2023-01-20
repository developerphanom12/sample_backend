import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { QuickbooksService } from './quickbooks.service';

@Controller('quickbooks')
export class QuickbooksController {
  constructor(private readonly quickBooksService: QuickbooksService) {}

  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  public async authorizeUser(@Res() res: Response) {
    return await this.quickBooksService.authorizeUser(res);
  }

  @Post('exchangeTokens')
  @HttpCode(HttpStatus.OK)
  public async exchangeTokens(@Body() body: { url: string }) {
    return await this.quickBooksService.exchangeTokens(body.url);
  }
}
