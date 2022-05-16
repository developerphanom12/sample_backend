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

@Entity('category')
export class CategoryEntity {
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

  @ManyToOne((type) => MemberEntity, (data) => data.categories)
  @JoinColumn()
  creator: MemberEntity;

  @ManyToOne((type) => CompanyEntity, (data) => data.categories, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;

  @ApiProperty({nullable: true})
  @OneToMany((type) => ReceiptEntity, (data) => data.category)
  receipts: ReceiptEntity[];
}
