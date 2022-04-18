import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './shared/configs/database.config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core/constants';
import { HttpErrorFilter } from './shared/http-error.filter';
import { UserInfoModule } from './user-info/user-info.module';
import { CurrencyModule } from './currency/currency.module';
import { AppController } from './app.controller'

const currentEnv = process.env.NODE_ENV || 'local';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${currentEnv}`,
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
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
