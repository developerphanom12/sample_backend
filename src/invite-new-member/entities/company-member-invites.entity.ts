import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { MemberEntity } from '../../company-member/entities/company-member.entity';

@Entity('company-member-invites')
export class MemberInvitesEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  userInvitorId: string;

  @ApiProperty()
  @Column({ nullable: true, default: false })
  isCompanyInvite: boolean;

  @ApiProperty()
  @OneToMany((type) => MemberEntity, (data) => data.memberInvite)
  @JoinColumn()
  members: MemberEntity[];
}
