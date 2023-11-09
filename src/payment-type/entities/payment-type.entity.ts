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
import { CompanyEntity } from '../../company/entities/company.entity';
import { ReceiptEntity } from '../../receipt/entities/receipt.entity';
import { MemberEntity } from '../../company-member/entities/company-member.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('payment-type')
export class PaymentTypeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column()
  name: string;

  @ManyToOne((type) => MemberEntity, (data) => data.payment_types, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  creator: MemberEntity;

  @ManyToOne((type) => CompanyEntity, (data) => data.payment_types, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;

  @OneToMany((type) => ReceiptEntity, (data) => data.payment_type, {
    onDelete: 'CASCADE',
  })
  receipts: ReceiptEntity[];
}
