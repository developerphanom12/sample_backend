import { Module } from '@nestjs/common';
import { CompanyMemberService } from './company-member.service';

@Module({
  providers: [CompanyMemberService]
})
export class CompanyMemberModule {}
