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
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { EReceiptStatus } from '../receipt.constants';
import { CurrencyEntity } from '../../currency/entities/currency.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';
import { ColumnNumericTransformer } from '../types/receipt.types';
import { ExpenseEntity } from 'src/expense-report/entities/expense.entity';
import { ExpenseReceiptEntity } from 'src/expense-report/entities/expense-receipt.entity';
import { SupplierAccEntity } from 'src/supplier-new/entities/suppliernew.entity';

@Entity('receipt')
export class ReceiptEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({ default: EReceiptStatus.processing })
  status: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  custom_id: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  receipt_date: Date;


  
  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  supplier: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  vat_code: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  net: number;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  tax: number;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total: number;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ nullable: true })
  @Column({ type :'jsonb', nullable: true })
  tableData ?: object[];

  @ApiProperty({ nullable: true })
  @Column({ nullable: true, default: false })
  publish_status: boolean;
 
  @ApiProperty({ nullable: true })
  @Column({ nullable: true, default: false })
  active_status: boolean;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true, default: false })
  approved_status: boolean;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true, default: false })
  payment_status: boolean;

  @ApiProperty({ nullable: true })
  @Column('simple-array', { nullable: true })
  photos: string[];

  @ManyToOne((type) => CompanyEntity, (data) => data.receipts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;

  @ManyToOne((type) => CurrencyEntity, (data) => data.receipts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  currency: CurrencyEntity;

  @ManyToOne((type) => SupplierEntity, (data) => data.receipts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  supplier_account: SupplierEntity;

  @ManyToOne((type) => CategoryEntity, (data) => data.receipts, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  category: CategoryEntity;

  @ManyToOne((type) => PaymentTypeEntity, (data) => data.receipts, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  payment_type: PaymentTypeEntity;

  @ManyToOne((type) => SupplierAccEntity, (data) => data.receipts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  supplier_accountid: SupplierAccEntity;

  @OneToMany(() => ExpenseReceiptEntity, expenseReceipt => expenseReceipt.receipt)
  expenseReceipts: ExpenseReceiptEntity[];
}
