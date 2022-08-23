import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { EmailsModule } from '../emails/emails.module';
import { InviteNewMemberModule } from '../invite-new-member/invite-new-member.module';
import { S3Module } from '../s3/s3.module';
import { CompanyMemberController } from './company-member.controller';
import { CompanyMemberService } from './company-member.service';
import { MemberEntity } from './entities/company-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, MemberEntity, AuthEntity]),
    EmailsModule,
    S3Module,
    InviteNewMemberModule,
    JwtModule.register({}),
  ],
  controllers: [CompanyMemberController],
  providers: [CompanyMemberService],
  exports: [CompanyMemberService],
})
export class CompanyMemberModule {}
