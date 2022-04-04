import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './shared/configs/database.config';
import { config } from './constants/config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core/constants';
import { HttpErrorFilter } from './shared/http-error.filter';
import { UserInfoController } from './user-info/user-info.controller';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoModule } from './user-info/user-info.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserInfoModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    UserInfoService,
  ],
  controllers: [UserInfoController],
})
export class AppModule {}
