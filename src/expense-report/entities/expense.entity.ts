import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CompanyEntity } from '../../company/entities/company.entity';
import { ExpenseStatus } from '../expense.constants';

@Entity('expense-report')
export class ExpenseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  @Exclude()
  updated: Date;

  @ApiProperty()
  @Column({default: null  })
  report_name: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  report_for: string;

  @ApiProperty({nullable: true ,default:null })
  @Column('simple-array', { nullable: true ,default:null })
  expenseReceipt: string[];

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  date: Date;


  @ManyToOne((type) => CompanyEntity, (company) => company.expense, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;
}
