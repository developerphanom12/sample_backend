import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsModule } from 'src/emails/emails.module';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { InviteNewMemberModule } from '../invite-new-member/invite-new-member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { ResetPasswordEntity } from './entities/reset-password.entity';
import { SocialAuthEntity } from './entities/social-auth.entity';
import { JwtStrategy } from './jwt.strategy';
import { RtStrategy } from './rt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      ResetPasswordEntity,
      SocialAuthEntity,
      CurrencyEntity,
      MemberEntity,
      CompanyEntity,
    ]),
    PassportModule.register({}),
    JwtModule.register({}),
    EmailsModule,
    InviteNewMemberModule,
  ],
  providers: [AuthService, JwtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
