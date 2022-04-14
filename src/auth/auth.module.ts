import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { UserInfoEntity } from '../user-info/entities/user-info.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { ResetPasswordEntity } from './entities/reset-password.entity';
import { SocialAuthEntity } from './entities/social-auth.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      ResetPasswordEntity,
      UserInfoEntity,
      SocialAuthEntity,
      CurrencyEntity,
    ]),
    PassportModule.register({}),
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
