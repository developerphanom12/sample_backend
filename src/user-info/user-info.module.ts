import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { UserInfoEntity } from './entities/user-info.entity';
import { UserInfoController } from './user-info.controller';
import { UserInfoService } from './user-info.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        UserInfoEntity,
        AuthEntity,
      ]),
    ],
    controllers: [UserInfoController],
    providers: [UserInfoService],
    exports: [UserInfoService],
  })
  export class UserInfoModule {}