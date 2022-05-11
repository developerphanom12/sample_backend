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

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({ default: '' })
  name: string;

  @Column({
    default: '',
  })
  date_format: string;

  @ManyToOne((type) => CurrencyEntity, (data) => data.company)
  @JoinColumn()
  currency: CurrencyEntity;

  @OneToMany((type) => MemberEntity, (data) => data.company)
  members: MemberEntity[];

  @OneToMany((type) => ReceiptEntity, (data) => data.company)
  receipts: ReceiptEntity[];

  @OneToMany((type) => SupplierEntity, (data) => data.company)
  suppliers: SupplierEntity[];

  @OneToMany((type) => CategoryEntity, (data) => data.company)
  categories: CategoryEntity[];

  @OneToMany((type) => PaymentTypeEntity, (data) => data.company)
  payment_types: PaymentTypeEntity[];
}
