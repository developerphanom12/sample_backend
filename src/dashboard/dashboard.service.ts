import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { EReceiptStatus } from 'src/receipt/receipt.constants';
import { Repository } from 'typeorm';
import { DASHBOARD_ERRORS } from './dashboard.errors';
import {
  ICompanyDetails,
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
    private configService: ConfigService,
  ) {}

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
      }),
      company_owner: companyOwner,
    };
  }

  async getReceiptsMetric(id: string): Promise<IReceiptMetric | null> {
    const company = await this.extractCompanyFromUser(id);
    const [receipts, total] = await this.receiptRepository.findAndCount({
      where: { company: company },
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
          declined: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.declined,
          ).length,
          completed: receipts.filter(
            (receipt) => receipt.status === EReceiptStatus.completed,
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
    return await accountsWithCompanies;
  }

  async getRecentReceipts(
    id: string,
    body?: DashboardStatisticDTO,
  ): Promise<ReceiptEntity[] | null> {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const sort_date = body.start_date || today;

    const company = await this.extractCompanyFromUser(id);
    const receipts = await this.receiptRepository.find({
      where: { company: company },
      order: { created: 'DESC' },
    });

    if (!receipts) {
      return null;
    }

    const result = receipts.filter((receipt) => receipt.created > sort_date);
    return result.length > 10 ? result.slice(0, 10) : result;
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
