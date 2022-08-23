import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';
import { InviteNewMemberService } from './invite-new-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberInvitesEntity])],
  providers: [InviteNewMemberService],
  exports: [InviteNewMemberService],
})
export class InviteNewMemberModule {}
