import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserInfoEntity } from './entities/user-info.entity';
import { UserInfoController } from './user-info.controller';
import { UserInfoService } from './user-info.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        UserInfoEntity,
        AuthEntity,
        CurrencyEntity,
      ]),
    ],
    controllers: [UserInfoController],
    providers: [UserInfoService],
    exports: [UserInfoService],
  })
  export class UserInfoModule {}