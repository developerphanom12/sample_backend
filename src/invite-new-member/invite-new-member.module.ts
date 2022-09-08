import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from 'src/company/company.module';
import { CompanyEntity } from 'src/company/entities/company.entity';

import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { MemberInvitesEntity } from './entities/company-member-invites.entity';
import { InviteNewMemberService } from './invite-new-member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberInvitesEntity,
      CompanyEntity,
      MemberEntity,
    ]),
    CompanyModule,
  ],
  providers: [InviteNewMemberService],
  exports: [InviteNewMemberService],
})
export class InviteNewMemberModule {}
