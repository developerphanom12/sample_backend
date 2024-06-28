import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { ExpenseEntity } from './entities/expense.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { isValidUUID } from './expense.constants';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private expenseRepository: Repository<ExpenseEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(ReceiptEntity)
    private receiptRepository:Repository<ReceiptEntity>
  ) {}

  private async extractCompanyFromActiveAccount(active_account: string) {
    const account = await this.memberRepository.findOne({
      where: { id: active_account },
      relations: ['company'],
    });

    if (!account) {
      throw new HttpException('COMPANY ACCOUNT NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['expense', 'currency', 'categories'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  private async extractCompanyFromUser(id: string) {
    const user = await this.authRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }
    const account = await this.memberRepository.findOne({
      where: { id: user.active_account },
      relations: ['company'],
    });

    if (!account) {
      throw new HttpException('COMPANY ACCOUNT NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['expense', 'currency'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  async createExpense(id: string, body: CreateExpenseDTO) {
    try {
      const company = body.active_account
        ? await this.extractCompanyFromActiveAccount(body.active_account)
        : await this.extractCompanyFromUser(id);
  
      let expenses = [];
  
      if (body.expenseReceipt && body.expenseReceipt.length > 0) {
        const receiptIds = body.expenseReceipt;
  
        const invalidReceiptIds = receiptIds.filter(id => !isValidUUID(id));
        if (invalidReceiptIds.length > 0) {
          throw new HttpException(`Invalid UUIDs: ${invalidReceiptIds.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
  
        const receipts = await this.receiptRepository.findByIds(receiptIds);
  
        const validReceiptIds = receipts.map(receipt => receipt.id);
        const missingReceiptIds = receiptIds.filter(id => !validReceiptIds.includes(id));
        if (missingReceiptIds.length > 0) {
          throw new HttpException(`Receipts not found for IDs: ${missingReceiptIds.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
  
        const currentDate = new Date();
        expenses = receiptIds.map(receiptId => {
          const expense = new ExpenseEntity();
          expense.report_for = body.report_for;
          expense.report_name = body.report_name;
          expense.expenseReceipt = [receiptId];
          expense.date = body.date || currentDate;
          expense.company = company;
          return expense;
        });
      } else {
        const expense = new ExpenseEntity();
        expense.report_for = body.report_for;
        expense.report_name = body.report_name;
        expense.expenseReceipt = null; // Set to null if not provided
        expense.date = body.date || new Date();
        expense.company = company;
        expenses.push(expense);
      }
  
      const savedExpenses = await this.expenseRepository.save(expenses);
      return {
        status: '200',
        data: savedExpenses.filter(expense => expense.company.id === company.id), // Filter expenses by company ID
      };
    } catch (error) {
      // Log any unexpected errors for debugging
      console.error('Unexpected error in createExpense:', error);
      // Rethrow the error to let NestJS handle it with default behavior (500 Internal Server Error)
      throw error;
    }
  }
  

  
}
