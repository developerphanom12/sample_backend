import { Test, TestingModule } from '@nestjs/testing';
import { CompanyMemberController } from './company-member.controller';

describe('CompanyMemberController', () => {
  let controller: CompanyMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyMemberController],
    }).compile();

    controller = module.get<CompanyMemberController>(CompanyMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
