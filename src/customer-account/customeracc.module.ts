import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CustomerAccEntity } from './entities/customeracc.entity';
import { CustomerAccController } from './customeracc.controller';
import { CustomerAccService } from './customeracc.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      CompanyEntity,
      MemberEntity,
      CustomerAccEntity,
    ]),
  ],
  controllers: [CustomerAccController],
  providers: [CustomerAccService],
  exports: [CustomerAccService],
})
export class CustomerAccModule {}
