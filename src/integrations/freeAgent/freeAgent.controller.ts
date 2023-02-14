import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FREE_AGENT_ROUTES, FREE_AGENT_SWAGGER } from './freeAgent.constants';
import { FreeAgentService } from './freeAgent.service';

@ApiTags(FREE_AGENT_SWAGGER.main)
@Controller(FREE_AGENT_ROUTES.main)
export class FreeAgentController {
  constructor(private readonly freeAgentService: FreeAgentService) {}

  @Post(FREE_AGENT_ROUTES.authorize)
  @ApiOperation({ summary: FREE_AGENT_SWAGGER.authorize })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FREE_AGENT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async authorizeUser() {
    return await this.freeAgentService.authorizeUser();
  }

  @Post(FREE_AGENT_ROUTES.exchange_tokens)
  @ApiOperation({ summary: FREE_AGENT_SWAGGER.exchange_tokens })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FREE_AGENT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async exchangeTokens(@Query('code') code: string) {
    return await this.freeAgentService.exchangeTokens(code);
  }
  // public async exchangeTokens(@Body() body: { code: string }) {
  //   return await this.freeAgentService.exchangeTokens(body.code);
  // }
}
