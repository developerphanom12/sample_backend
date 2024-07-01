import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CompanyEntity } from '../../company/entities/company.entity';
import { ExpenseReceiptEntity } from './expense-receipt.entity';

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
  @Column({ default: null })
  report_name: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  report_for: string;

  @OneToMany(() => ExpenseReceiptEntity, expenseReceipt => expenseReceipt.expense, {
    cascade: true,
  })
  expenseReceipts: ExpenseReceiptEntity[];

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  date: Date;

  @ManyToOne(() => CompanyEntity, company => company.expense, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: CompanyEntity;
}
