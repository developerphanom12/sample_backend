import { Module } from '@nestjs/common';

import { QuickbooksController } from './quickbooks.controller';
import { QuickbooksService } from './quickbooks.service';

@Module({
  imports: [],
  providers: [QuickbooksService],
  controllers: [QuickbooksController],
})
export class QuickbooksModule {}
