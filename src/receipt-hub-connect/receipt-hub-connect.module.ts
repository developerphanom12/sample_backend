import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as cors from 'cors';

import { AuthEntity } from '../auth/entities/auth.entity';
import { S3Module } from '../s3/s3.module';
import { ReceiptHubConnectController } from './receipt-hub-connect.controller';
import { ReceiptHubConnectService } from './receipt-hub-connect.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({}),
    S3Module,
  ],
  providers: [ReceiptHubConnectService],
  controllers: [ReceiptHubConnectController],
})
export class ReceiptHubConnectModule {}
