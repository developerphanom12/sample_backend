import { Exclude } from 'class-transformer';
import { AuthEntity } from 'src/auth/entityes/auth.entity';
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
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column()
  currency: string;

  @OneToOne((type) => AuthEntity, (data) => data.userInfo)
  @JoinColumn()
  user: AuthEntity;
}
