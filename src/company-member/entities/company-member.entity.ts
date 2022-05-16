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
import { AuthEntity } from '../../auth/entities/auth.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { ECompanyRoles } from '../company-member.constants';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';

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
  @ManyToOne((type) => CompanyEntity, (data) => data.members, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  company: CompanyEntity;

  @OneToMany((type) => SupplierEntity, (data) => data.creator)
  @JoinColumn()
  suppliers: SupplierEntity[];

  @OneToMany((type) => CategoryEntity, (data) => data.creator)
  @JoinColumn()
  categories: CategoryEntity[];

  @OneToMany((type) => PaymentTypeEntity, (data) => data.creator)
  @JoinColumn()
  payment_types: PaymentTypeEntity[];

  @ManyToOne((type) => AuthEntity, (data) => data.accounts)
  user: AuthEntity;
}
