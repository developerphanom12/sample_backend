import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from 'src/company/company.module';
import { CompanyEntity } from 'src/company/entities/company.entity';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';
import { InviteNewMemberService } from './invite-new-member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberInvitesEntity, CompanyEntity]),
    CompanyModule,
  ],
  providers: [InviteNewMemberService],
  exports: [InviteNewMemberService],
})
export class InviteNewMemberModule {}
