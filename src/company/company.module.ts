import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { S3Module } from 'src/s3/s3.module';

import { MemberEntity } from '../company-member/entities/company-member.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyEntity } from './entities/company.entity';
import { EmailsModule } from '../emails/emails.module';
import { MemberInvitesEntity } from '../invite-new-member/entities/company-member-invites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      MemberEntity,
      ReceiptEntity,
      AuthEntity,
      CurrencyEntity,
      MemberInvitesEntity,
    ]),
    S3Module,
    EmailsModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
