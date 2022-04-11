import { Exclude } from 'class-transformer';
import { AuthEntity } from '../../auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';

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
  date_format: string;

  @OneToOne((type) => AuthEntity, (data) => data.userInfo)
  @JoinColumn()
  user: AuthEntity;

  @JoinColumn()
  @ManyToOne((type) => CurrencyEntity, (data) => data.userInfo)
  currency: CurrencyEntity;
}
