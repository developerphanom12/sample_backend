import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { QuickbooksController } from './quickbooks.controller';
import { QuickbooksService } from './quickbooks.service';

@Module({
  imports: [HttpModule],
  providers: [QuickbooksService],
  controllers: [QuickbooksController],
})
export class QuickbooksModule {}
