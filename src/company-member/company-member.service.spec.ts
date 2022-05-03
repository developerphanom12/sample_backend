import { Test, TestingModule } from '@nestjs/testing';
import { CompanyMemberService } from './company-member.service';

describe('CompanyMemberService', () => {
  let service: CompanyMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyMemberService],
    }).compile();

    service = module.get<CompanyMemberService>(CompanyMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
