import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExpenseEntity } from './expense.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';

@Entity('expense_receipt')
export class ExpenseReceiptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExpenseEntity, expense => expense.expenseReceipts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expenseId' })
  expense: ExpenseEntity;

  @ManyToOne(() => ReceiptEntity, receipt => receipt.expenseReceipts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiptId' })
  receipt: ReceiptEntity;
}
