import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SocialAuthEntity } from './social-auth.entity';
import { UserInfoEntity } from 'src/user-info/entities/user-info.entity';

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

  @Column({
    default: false,
  })
  isOnboardingDone: boolean;

  @OneToOne((type) => UserInfoEntity, (data) => data.user)
  userInfo: UserInfoEntity;

  @OneToOne((type) => SocialAuthEntity, (data) => data.auth)
  socialAuth: SocialAuthEntity;
}
