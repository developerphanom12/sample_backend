import { Module } from '@nestjs/common';
import { ReceiptLogService } from './receipt-log.service';

@Module({
  providers: [ReceiptLogService]
})
export class ReceiptLogModule {}
