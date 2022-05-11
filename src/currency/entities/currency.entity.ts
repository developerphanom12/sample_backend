import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ReceiptEntity } from '../../receipt/entities/receipt.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

@Entity('currency')
export class CurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({
    default: '',
  })
  value: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany((type) => CompanyEntity, (data) => data.currency)
  company: CompanyEntity;

  @OneToMany((type) => ReceiptEntity, (data) => data.currency)
  receipts: ReceiptEntity;
}
