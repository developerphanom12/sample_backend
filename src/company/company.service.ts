import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';

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
    private configService: ConfigService,
  ) {}

  async createCompany(id: string, body: CreateCompanyDTO) {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    const selectedCurrency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });
    if (!selectedCurrency) {
      throw new HttpException('Invalid currency', HttpStatus.BAD_REQUEST);
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
      company: company,
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
      account: await this.memberRepository.findOne({
        where: { id: user_company_account.id },
      }),
      company: await this.companyRepository.findOne({
        where: { id: company.id },
      }),
      user: await this.authRepository.findOne({
        where: { id: user.id },
        relations: ['accounts'],
      }),
    };
  }

  async getCompany(id: string, companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }
    return company;
  }

  private async getAccountCompany(account: MemberEntity) {
    const acc = await this.memberRepository.findOne({
      where: { id: account.id },
      relations: ['company'],
    });
    return acc.company;
  }

  async getAllCompanies(id: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    const accounts = user.accounts;

    const promises = accounts.map((account) => this.getAccountCompany(account));

    const result = await Promise.all(promises);

    return await result;
  }
}
