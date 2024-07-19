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
import { SaleEntity } from 'src/sales/entities/sale.entity';
import { ExpenseEntity } from 'src/expense-report/entities/expense.entity';
import { CustomerAccEntity } from 'src/customer-account/entities/customeracc.entity';
import { CustomerEntity } from 'src/customernew/entities/customernew.entity';

@Entity('company')
export class CompanyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({ default: '', nullable: true })
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
  @OneToMany((type) => MemberEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  members: MemberEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => ReceiptEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  receipts: ReceiptEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => SupplierEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  suppliersAccounts: SupplierEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => CustomerAccEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  customeraccount: CustomerAccEntity[];


  @ApiProperty({ nullable: true })
  @OneToMany((type) => CategoryEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  categories: CategoryEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => PaymentTypeEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  payment_types: PaymentTypeEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => SaleEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  sales: SaleEntity[];

  @ApiProperty({ nullable: true })
  @OneToMany((type) => ExpenseEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })
  expense: ExpenseEntity[];
  
  @ApiProperty({ nullable: true })
  @OneToMany((type) => CustomerEntity, (data) => data.company, {
    onDelete: 'CASCADE',
  })       
  customerNEWaccount: CustomerEntity[];
}
      