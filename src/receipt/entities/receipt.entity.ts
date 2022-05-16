import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EReceiptStatus } from '../receipt.constants';
import { CurrencyEntity } from '../../currency/entities/currency.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';

@Entity('receipt')
export class ReceiptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({ default: EReceiptStatus.processing })
  status: EReceiptStatus;

  @Column({ nullable: true })
  custom_id: string;

  @Column({ nullable: true })
  receipt_date: Date;

  @Column({ nullable: true })
  supplier_account: string;

  @Column({ nullable: true })
  vat_code: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  net: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, default: false })
  publish_status: boolean;

  @Column({ nullable: true, default: false })
  payment_status: boolean;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @ManyToOne((type) => CompanyEntity, (data) => data.receipts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;

  @ManyToOne((type) => CurrencyEntity, (data) => data.receipts)
  @JoinColumn()
  currency: CurrencyEntity;

  @ManyToOne((type) => SupplierEntity, (data) => data.receipts)
  @JoinColumn()
  supplier: SupplierEntity;

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
}
