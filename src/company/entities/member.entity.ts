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
import { CompanyEntity } from './company.entity';
  
  @Entity('member')
  export class MemberEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @CreateDateColumn()
    @Exclude()
    created: Date;
  
    @UpdateDateColumn()
    @Exclude()
    updated: Date;
  
    @Column({ default: '' })
    role: string;
  
    @JoinColumn()
    @ManyToOne((type) => CompanyEntity, (data) => data.members)
    company: CompanyEntity;

    // @OneToMany((type) => ReceiptLogEntity, (data) => data.member)
    // receipt_logs: ReceiptLogEntity[]
  }
  