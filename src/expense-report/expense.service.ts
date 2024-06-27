import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { ExpenseEntity } from './entities/expense.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';

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
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    if (!body.expenseReceipt || body.expenseReceipt.length === 0) {
      const expense = new ExpenseEntity();
      expense.report_for = body.report_for;
      expense.report_name = body.report_name;
      expense.expenseReceipt = null;
      expense.date = body.date;
      expense.company = company;

      await this.expenseRepository.save(expense);
      return expense;
    }

    const currentDate = new Date();

    const expenses = body.expenseReceipt.map(receipt => {
      const expense = new ExpenseEntity();
      expense.report_for = body.report_for;
      expense.report_name = body.report_name;
      expense.expenseReceipt = [receipt] ;
      expense.date = body.date || currentDate;
      expense.company = company;
      return expense;
    });

    const savedExpenses = await this.expenseRepository.save(expenses);
    return {
      status: '200',
      data: savedExpenses.filter(expense => expense.company.id === company.id), // Filter expenses by company ID
    };
  }
}
