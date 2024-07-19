import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { SupplierAccController } from './suppliernew.controller';
import { SupplierAccService } from './suppliernew.service';
import { SupplierAccEntity } from './entities/suppliernew.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      CompanyEntity,
      MemberEntity,
      SupplierAccEntity,
    ]),
  ],
  controllers: [SupplierAccController],
  providers: [SupplierAccService],
  exports: [SupplierAccService],
})
export class SupplierAccModule {}
