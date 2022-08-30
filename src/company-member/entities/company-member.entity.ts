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
import { ApiProperty } from '@nestjs/swagger';
import { MemberInvitesEntity } from '../../invite-new-member/entities/company-member-invites.entity';

@Entity('company-member')
export class MemberEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({ default: '' })
  name: string;

  @ApiProperty()
  @Column({ default: '' })
  userInvitorName: string;

  @ApiProperty()
  @Column({ default: ECompanyRoles.user })
  role: ECompanyRoles;

  @ApiProperty()
  @JoinColumn()
  @ManyToOne((type) => CompanyEntity, (data) => data.members, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  company: CompanyEntity;

  @ApiProperty()
  @OneToMany((type) => SupplierEntity, (data) => data.creator)
  @JoinColumn()
  suppliers: SupplierEntity[];

  @ApiProperty()
  @OneToMany((type) => CategoryEntity, (data) => data.creator)
  @JoinColumn()
  categories: CategoryEntity[];

  @ApiProperty()
  @OneToMany((type) => PaymentTypeEntity, (data) => data.creator)
  @JoinColumn()
  payment_types: PaymentTypeEntity[];

  @ApiProperty()
  @ManyToOne((type) => AuthEntity, (data) => data.accounts)
  user: AuthEntity;

  @ApiProperty()
  @ManyToOne((type) => MemberInvitesEntity, (data) => data.members, {
    onDelete: 'SET NULL',
  })
  memberInvite: MemberInvitesEntity;
}
