import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';

export interface IReceiptMetric {
  processing: number;
  review: number;
  declined: number;
  completed: number;
}

export interface ICompanyDetails {
  account: MemberEntity;
  company: CompanyEntity;
  company_owner: MemberEntity;
}

export interface IDashboardStatistic {
  metric: IReceiptMetric | null;
  companies: ICompanyDetails[] | null;
  receipts: IDashboardRecent | null;
}

export interface IDashboardRecent {
  data: ReceiptEntity[];
  count: number;
}
