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
import { PaginationDTO } from './dto/update-expense.dto';
import { ExpenseReceiptEntity } from './entities/expense-receipt.entity';

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
    private receiptRepository:Repository<ReceiptEntity>,
    @InjectRepository(ExpenseReceiptEntity)
    private expenseReceiptRepository: Repository<ExpenseReceiptEntity>,
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
        const expense = new ExpenseEntity();
        expense.report_for = body.report_for;
        expense.report_name = body.report_name;
        expense.date = body.date || currentDate;
        expense.company = company;
        const savedExpense = await this.expenseRepository.save(expense);

        const expenseReceipts = receipts.map(receipt => {
          const expenseReceipt = new ExpenseReceiptEntity();
          expenseReceipt.expense = savedExpense;
          expenseReceipt.receipt = receipt;
          return expenseReceipt;
        });

        await this.expenseReceiptRepository.save(expenseReceipts);
        expenses.push(savedExpense);
      } else {
        const expense = new ExpenseEntity();
        expense.report_for = body.report_for;
        expense.report_name = body.report_name;
        expense.expenseReceipts = []; // Ensure it's properly handled when no receipts are provided
        expense.date = body.date || new Date();
        expense.company = company;
        const savedExpense = await this.expenseRepository.save(expense);
        expenses.push(savedExpense);
      }

      return {
        status: '200',
        data: expenses.filter(expense => expense.company.id === company.id), // Filter expenses by company ID
      };
    } catch (error) {
      console.error('Unexpected error in createExpense:', error);
      throw error;
    }
  }
  

  public async getReceipts(id: string, body: PaginationDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [expenses, totalCount] = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.expenseReceipts', 'expenseReceipt')
      .leftJoinAndSelect('expenseReceipt.receipt', 'receipt')
      .where('expense.companyId = :companyId', { companyId: company.id })
      .take(body.take ?? 10)
      .skip(body.skip ?? 0)
      .getManyAndCount();

    let report_tax_total = 0;
    let report_total = 0;

    const response = {
      status: '200',
      data: expenses.map(expense => {
        let reportTotalTax = 0;
        let reportTotalAmount = 0;

        const receiptsData = expense.expenseReceipts.map(expenseReceipt => {
          reportTotalTax += expenseReceipt.receipt.tax || 0;
          reportTotalAmount += expenseReceipt.receipt.total || 0;

          return {
            id: expenseReceipt.receipt.id,
            created: expenseReceipt.receipt.created,
            status: expenseReceipt.receipt.status,
            custom_id: expenseReceipt.receipt.custom_id,
            receipt_date: expenseReceipt.receipt.receipt_date,
            supplier: expenseReceipt.receipt.supplier,
            vat_code: expenseReceipt.receipt.vat_code,
            net: expenseReceipt.receipt.net,
            tax: expenseReceipt.receipt.tax,
            total: expenseReceipt.receipt.total,
            description: expenseReceipt.receipt.description,
            publish_status: expenseReceipt.receipt.publish_status,
            active_status: expenseReceipt.receipt.active_status,
            approved_status: expenseReceipt.receipt.approved_status,
            payment_status: expenseReceipt.receipt.payment_status,
            photos: expenseReceipt.receipt.photos,
          };
        });

        report_tax_total += reportTotalTax;
        report_total += reportTotalAmount;

        return {
          expense_report_id: expense.id,
          expense_report_name: expense.report_name,
          expense_report_for: expense.report_for,
          expense_created_date: expense.created,
          report_receipt: receiptsData,
          report_total_tax: reportTotalTax,
          report_total_amount: reportTotalAmount,
        };
      }),
    };

    return response;
  }

  
}