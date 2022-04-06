import { Exclude } from 'class-transformer';
import { AuthEntity } from '../../auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user-info')
export class UserInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
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
  currency: string;

  @Column({
    default: '',
  })
  date_format: string;

  @OneToOne((type) => AuthEntity, (data) => data.userInfo)
  @JoinColumn()
  user: AuthEntity;
}
