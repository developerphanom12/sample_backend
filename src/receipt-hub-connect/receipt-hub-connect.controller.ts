import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoginDTO } from '../auth/dto/login.dto';
import {
  RECEIPT_PHOTOS_LIMIT,
  RECEIPT_SWAGGER,
} from '../receipt/receipt.constants';
import {
  RH_CONNECT_ROUTES,
  RH_CONNECT_SWAGGER,
} from './receipt-hub-connect.constants';
import { ReceiptHubConnectService } from './receipt-hub-connect.service';
import { IRHconnect } from './receipt-hub-connect.types';

@ApiBearerAuth()
@ApiTags(RH_CONNECT_ROUTES.main)
@Controller(RH_CONNECT_ROUTES.main)
export class ReceiptHubConnectController {
  constructor(private readonly rhConnectService: ReceiptHubConnectService) {}

  @Post(RH_CONNECT_ROUTES.parse)
  @UseInterceptors(FilesInterceptor('receipt_photos', RECEIPT_PHOTOS_LIMIT))
  @ApiOperation({ summary: RH_CONNECT_ROUTES.parse })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async creteReceipt(@UploadedFiles() files) {
    return await this.rhConnectService.parseReceipt(files);
  }

  @Post(RH_CONNECT_ROUTES.rh_connect)
  @ApiOperation({ summary: RH_CONNECT_SWAGGER.rh_connect })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RH_CONNECT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async receiptHubConnect(@Body() body: LoginDTO): Promise<IRHconnect> {
    return await this.rhConnectService.receiptHubConnect(body);
  }
}
