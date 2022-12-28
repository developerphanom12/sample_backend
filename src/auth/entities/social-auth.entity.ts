import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsBoolean } from 'class-validator';
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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  appleId: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  appleEmail: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  googleId: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  googleEmail: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  capiumId: string;

  @ApiProperty({ nullable: true })
  @Column({
    nullable: true,
  })
  capiumEmail: string;

  @OneToOne((type) => AuthEntity, (data) => data.socialAuth)
  @JoinColumn()
  auth: AuthEntity;
}
