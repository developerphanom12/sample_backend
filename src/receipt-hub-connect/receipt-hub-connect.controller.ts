import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoginDTO } from '../auth/dto/login.dto';
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
