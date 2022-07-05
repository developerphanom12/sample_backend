import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CurrencyEntity } from '../../currency/entities/currency.entity';
import { MemberEntity } from '../../company-member/entities/company-member.entity';
import { ReceiptEntity } from '../../receipt/entities/receipt.entity';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('company')
export class CompanyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({ default: '' })
  name: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty()
  @Column({
    default: '',
  })
  date_format: string;

  @ApiProperty({ nullable: true })
  @ManyToOne((type) => CurrencyEntity, (data) => data.company, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  currency: CurrencyEntity;

  @ApiProperty({ nullable: true })
  @OneToMany((type) => MemberEntity, (data) => data.company)
  members: MemberEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => ReceiptEntity, (data) => data.company)
  receipts: ReceiptEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => SupplierEntity, (data) => data.company)
  suppliers: SupplierEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => CategoryEntity, (data) => data.company)
  categories: CategoryEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => PaymentTypeEntity, (data) => data.company)
  payment_types: PaymentTypeEntity[];
}
