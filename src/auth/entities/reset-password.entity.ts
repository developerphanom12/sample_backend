import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity('reset-password')
export class ResetPasswordEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  token: string;

  @CreateDateColumn()
  created: string;
}
