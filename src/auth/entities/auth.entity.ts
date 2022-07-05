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
import { ApiProperty } from '@nestjs/swagger';

@Entity('auth')
export class AuthEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Exclude()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({
    default: '',
  })
  fullName: string;

  @ApiProperty()
  @Column({
    default: '',
  })
  country: string;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  email: string;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  @Exclude()
  password: string;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  profile_image: string;

  @Column({
    default: '',
  })
  @Exclude()
  publicKey: string;

  @ApiProperty({nullable: true})
  @OneToOne((type) => SocialAuthEntity, (data) => data.auth)
  socialAuth: SocialAuthEntity;

  @ApiProperty({nullable: true})
  @Column({ nullable: true })
  active_account: string;

  @ApiProperty({nullable: true})
  @JoinColumn()
  @OneToMany((type) => MemberEntity, (data) => data.user)
  accounts: MemberEntity[];
}
