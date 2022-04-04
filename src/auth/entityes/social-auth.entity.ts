import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthEntity } from './auth.entity';

@Entity('social-auth')
export class SocialAuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @Column({
    nullable: true,
  })
  appleId: string;
  @Column({
    nullable: true,
  })
  appleEmail: string;

  @Column({
    nullable: true,
  })
  capiumId: string;
  @Column({
    nullable: true,
  })
  capiumEmail: string;

  @OneToOne((type) => AuthEntity, (data) => data.socialAuth)
  @JoinColumn()
  auth: AuthEntity;
}
