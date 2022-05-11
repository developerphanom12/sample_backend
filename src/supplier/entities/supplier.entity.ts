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
import { CompanyEntity } from 'src/company/entities/company.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';

@Entity('supplier')
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column()
  name: string;

  @ManyToOne((type) => MemberEntity, data => data.suppliers)
  @JoinColumn()
  creator: MemberEntity;

  @ManyToOne((type) => CompanyEntity, (data) => data.suppliers)
  @JoinColumn()
  company: CompanyEntity;

  @OneToMany((type) => ReceiptEntity, (data) => data.supplier)
  receipts: ReceiptEntity[];
}