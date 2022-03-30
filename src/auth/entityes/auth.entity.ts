import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

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
}
