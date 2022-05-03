import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptLogController } from './receipt-log.controller';

describe('ReceiptLogController', () => {
  let controller: ReceiptLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptLogController],
    }).compile();

    controller = module.get<ReceiptLogController>(ReceiptLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
