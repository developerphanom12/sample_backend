import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserInfoEntity } from '../../user-info/entities/user-info.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';

@Entity('currency')
export class CurrencyEntity {
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
  value: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany((type) => UserInfoEntity, (data) => data.currency)
  userInfo: UserInfoEntity;

  @OneToMany((type) => ReceiptEntity, (data) => data.currency)
  receipts: ReceiptEntity;
}
