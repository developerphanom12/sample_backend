import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SocialAuthEntity } from './social-auth.entity';
import { MemberEntity } from '../../company-member/entities/company-member.entity';

@Entity('auth')
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({
    default: '',
  })
  fullName: string;

  @Column({
    default: '',
  })
  country: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({
    default: '',
  })
  @Exclude()
  publicKey: string;

  @OneToOne((type) => SocialAuthEntity, (data) => data.auth)
  socialAuth: SocialAuthEntity;

  @Column({ nullable: true })
  active_account: string;

  @JoinColumn()
  @OneToMany((type) => MemberEntity, (data) => data.user)
  accounts: MemberEntity[];
}
