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
  import { ApiProperty } from '@nestjs/swagger';
import { SaleEntity } from 'src/sales/entities/sale.entity';
  
  @Entity('customer-account')
  export class CustomerAccEntity {
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
  
  
    @ApiProperty()
    @Column({default :null})
    purchase: string;
  
    @ManyToOne((type) => MemberEntity, (data) => data.suppliersAccounts, {
      onDelete: 'CASCADE',
    })
    @JoinColumn()
    creator: MemberEntity;
  
    @ManyToOne((type) => CompanyEntity, (data) => data.suppliersAccounts, {
      cascade: true,
      onDelete: 'CASCADE',
    })
    @JoinColumn()
    company: CompanyEntity;
  
    @OneToMany((type) => SaleEntity, (data) => data.supplier_account, {
      onDelete: 'CASCADE',
    })
    sales: SaleEntity[];
  }
  