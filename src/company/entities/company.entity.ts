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
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { MemberEntity } from './member.entity';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({ default: '' })
  name: string;

  @Column({
    default: '',
  })
  date_format: string;

  @JoinColumn()
  @ManyToOne((type) => CurrencyEntity, (data) => data.company)
  currency: CurrencyEntity;

  @OneToMany((type) => MemberEntity, (data) => data.company)
  members: MemberEntity[]
}
