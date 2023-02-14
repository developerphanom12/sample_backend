import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { FreeAgentController } from './freeAgent.controller';
import { FreeAgentService } from './freeAgent.service';
import { FreeAgentConfigService } from './config';

@Module({
  imports: [HttpModule],
  providers: [FreeAgentService, FreeAgentConfigService],
  controllers: [FreeAgentController],
})
export class FreeAgentModule {}
