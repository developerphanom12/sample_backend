import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { ReceiptHubConnectController } from './receipt-hub-connect.controller';
import { ReceiptHubConnectService } from './receipt-hub-connect.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity]), JwtModule.register({})],
  providers: [ReceiptHubConnectService],
  controllers: [ReceiptHubConnectController],
})
export class ReceiptHubConnectModule {}
