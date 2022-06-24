import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CompanyMemberController } from './company-member.controller';
import { CompanyMemberService } from './company-member.service';
import { MemberEntity } from './entities/company-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, MemberEntity, AuthEntity]),
  ],
  controllers: [CompanyMemberController],
  providers: [CompanyMemberService],
  exports: [CompanyMemberService],
})
export class CompanyMemberModule {}
