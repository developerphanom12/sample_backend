import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptLogService } from './receipt-log.service';

describe('ReceiptLogService', () => {
  let service: ReceiptLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptLogService],
    }).compile();

    service = module.get<ReceiptLogService>(ReceiptLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
