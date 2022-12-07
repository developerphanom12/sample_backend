import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { ECompanyRoles } from '../company-member/company-member.constants';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ReceiptEntity } from '../receipt/entities/receipt.entity';
import { EReceiptStatus } from '../receipt/receipt.constants';
import { Between, MoreThan, Repository } from 'typeorm';
import { DASHBOARD_ERRORS } from './dashboard.errors';
import {
  ICompanyDetails,
  IDashboardRecent,
  IDashboardStatistic,
  IReceiptMetric,
} from './dashboard.types';
import { DashboardStatisticDTO } from './dto/dashboard-get-statistic.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(ReceiptEntity)
    private receiptRepository: Repository<ReceiptEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  private async extractCompanyFromActiveAccount(active_account: string) {
    const account = await this.memberRepository.findOne({
      where: { id: active_account },
      relations: ['company'],
    });

    if (!account) {
      throw new HttpException(
        'COMPANY ACCOUNT NOT FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }

    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['receipts', 'currency', 'categories'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  private async extractCompanyFromUser(id: string): Promise<CompanyEntity> {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });

    const account = await this.memberRepository.findOne({
      where: { id: user.active_account },
      relations: ['company'],
    });

    if (!account) {
      throw new HttpException(
        DASHBOARD_ERRORS.account_not_found,
        HttpStatus.NOT_FOUND,
      );
    }
    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['receipts'],
    });

    if (!company) {
      throw new HttpException(
        DASHBOARD_ERRORS.company_not_found,
        HttpStatus.NOT_FOUND,
      );
    }
    return company;
  }
  private async getCompanyDetails(acc: MemberEntity): Promise<ICompanyDetails> {
    const account = await this.memberRepository.findOne({
      where: { id: acc.id },
      relations: ['company'],
    });
    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['members'],
    });
    const companyOwner = company.members.filter(
      (member) => member.role === ECompanyRoles.owner,
    )[0];

    return {
      account: await this.memberRepository.findOne({
        where: { id: account.id },
      }),
      company: await this.companyRepository.findOne({
        where: { id: company.id },
        relations: ['currency'],
      }),
      company_owner: companyOwner,
    };
  }

  async getReceiptsMetric(
    id: string,
    active_account?: string,
  ): Promise<IReceiptMetric | null> {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);
    const [receipts, total] = await this.receiptRepository.findAndCount({
      where: { company: { id: company.id } },
      order: { created: 'DESC' },
    });

    const receiptMetric = receipts
      ? {
          processing: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.processing,
          ).length,
          review: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.review,
          ).length,
          rejected: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.rejected,
          ).length,
          accepted: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.accepted,
          ).length,
        }
      : null;

    return receiptMetric;
  }

  async getUserCompanies(id: string): Promise<ICompanyDetails[]> {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    const promises = user.accounts.map((account) =>
      this.getCompanyDetails(account),
    );
    const accountsWithCompanies = await Promise.all(promises);
    return await accountsWithCompanies.filter((el) => el.company.name);
  }

  async getRecentReceipts(
    id: string,
    body?: DashboardStatisticDTO,
  ): Promise<IDashboardRecent | null> {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const sort_date_start = body.date_start || today;
    const sort_date_end = body.date_end || tomorrow;

    const sort_date =
      body.date_start && body.date_end
        ? Between(sort_date_start, sort_date_end)
        : MoreThan(sort_date_start);

    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [receipts, total] = await this.receiptRepository.findAndCount({
      relations: ['currency', 'supplier_account'],
      where: { company: { id: company.id }, created: sort_date },
      order: { created: 'DESC' },
    });

    return {
      data: receipts,
      count: total,
    };
  }

  public async getDashboardInfo(
    id: string,
    body?: DashboardStatisticDTO,
  ): Promise<IDashboardStatistic> {
    return {
      metric: await this.getReceiptsMetric(id),
      companies: await this.getUserCompanies(id),
      receipts: await this.getRecentReceipts(id, body),
    };
  }
}
