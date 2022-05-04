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
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';

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
  receipt_date: Date;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  supplier_account: string;

  @Column({ nullable: true })
  category: string;

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

  @Column('simple-array', { nullable: true })
  photos: string[];

  @ManyToOne((type) => CompanyEntity, (data) => data.receipts)
  @JoinColumn()
  company: CompanyEntity;

  @ManyToOne((type) => CurrencyEntity, (data) => data.receipts)
  @JoinColumn()
  currency: CurrencyEntity;
}
