import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { ECompanyRoles } from '../company-member/company-member.constants';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { Repository } from 'typeorm';
import { COMPANY_ERRORS } from './company.errors';
import { ICreateCompany } from './company.types';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  async createCompany(
    id: string,
    body: CreateCompanyDTO,
  ): Promise<ICreateCompany> {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const selectedCurrency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });
    if (!selectedCurrency) {
      throw new HttpException(COMPANY_ERRORS.currency, HttpStatus.NOT_FOUND);
    }

    const company = await this.companyRepository.save({
      currency: selectedCurrency,
      name: body.name || 'Default',
      date_format: body.date_format,
    });

    const user_company_account = await this.memberRepository.save({
      name: user.fullName,
      role: ECompanyRoles.owner,
      user: user,
      company: {id: company.id},
    });
    if (!user.accounts || user.accounts.length === 0) {
      await this.authRepository.update(id, {
        active_account: user_company_account.id,
      });
    } else {
      await this.authRepository.update(id, {
        active_account: user_company_account.id,
      });
    }
    return {
      company: await this.companyRepository.findOne({
        where: { id: company.id },
        relations: ['currency'],
      }),
      user: await this.authRepository.findOne({
        where: { id: user.id },
        relations: ['accounts'],
      }),
    };
  }

  async getCompany(id: string, companyId: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException(COMPANY_ERRORS.company, HttpStatus.NOT_FOUND);
    }
    return company;
  }

  private async getAccountCompany(
    account: MemberEntity,
  ): Promise<CompanyEntity> {
    const acc = await this.memberRepository.findOne({
      where: { id: account.id },
      relations: ['company'],
    });
    return acc.company;
  }

  async getAllCompanies(id: string): Promise<CompanyEntity[]> {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const accounts = user.accounts;
    const promises = accounts.map((account) => this.getAccountCompany(account));
    const result = await Promise.all(promises);
    return await result;
  }

  async companyDelete(id: string, companyId: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });

    if (!user) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['receipts'],
    });
    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.NOT_FOUND);
    }
    if (company.receipts) {
      this.s3Service.deleteFolder(company.id);
    }

    try {
      await this.companyRepository.remove(company);
      return 'COMPANY DELETED';
    } catch (e) {
      console.log(e);
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
