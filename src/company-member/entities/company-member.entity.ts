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
import { AuthEntity } from '../../auth/entities/auth.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { ECompanyRoles } from '../company-member.constants';

@Entity('company-member')
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
  name: string;

  @Column({ default: ECompanyRoles.user })
  role: ECompanyRoles;

  @JoinColumn()
  @ManyToOne((type) => CompanyEntity, (data) => data.members)
  company: CompanyEntity;

  @ManyToOne((type) => AuthEntity, (data) => data.accounts)
  user: AuthEntity;
}
