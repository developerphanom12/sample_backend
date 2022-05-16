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
import { ApiProperty } from '@nestjs/swagger';

@Entity('currency')
export class CurrencyEntity {
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
  @Column({
    default: '',
  })
  value: string;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  country: string;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  description: string;

  @OneToMany((type) => CompanyEntity, (data) => data.currency)
  company: CompanyEntity;

  @OneToMany((type) => ReceiptEntity, (data) => data.currency)
  receipts: ReceiptEntity;
}
