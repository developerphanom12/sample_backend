import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CustomerEntity } from './entities/customernew.entity';
import { CustomerAccController } from './customernew.controller';
import { CustomerService } from './customernew.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      CompanyEntity,
      MemberEntity,
      CustomerEntity,
    ]),
  ],
  controllers: [CustomerAccController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
