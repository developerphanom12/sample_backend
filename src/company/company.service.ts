import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { ECompanyRoles } from '../company-member/company-member.constants';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { In, Like, Repository } from 'typeorm';
import { COMPANY_ERRORS } from './company.errors';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { S3Service } from 'src/s3/s3.service';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateCompanyDTO } from './dto/update-company.dto';
import { MemberInvitesEntity } from '../invite-new-member/entities/company-member-invites.entity';

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
    @InjectRepository(MemberInvitesEntity)
    private memberInvitesRepository: Repository<MemberInvitesEntity>,
    private s3Service: S3Service,
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

  private async extractCompanyFromUser(id: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }
    const account = await this.memberRepository.findOne({
      where: { id: user.active_account },
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

  private async getAccountCompany(
    account: MemberEntity,
  ): Promise<CompanyEntity> {
    const acc = await this.memberRepository.findOne({
      where: { id: account.id },
      relations: ['company'],
    });
    return acc.company;
  }

  private async setCompanyLogo(
    file,
    companyId: string,
  ): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.NOT_FOUND);
    }
    if (!file) {
      throw new HttpException('NO LOGO IMAGE', HttpStatus.BAD_REQUEST);
    }
    if (!!company.logo) {
      try {
        await this.s3Service.deleteFile(`${companyId}/logo/${company.logo}`);
      } catch (e) {
        console.log(e);
        throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
      }
    }

    const folderName = `${companyId}/logo`;
    const { key } = await this.s3Service.loadFile(file, folderName);

    await this.companyRepository.update(company.id, {
      logo: key.split('/')[2],
    });

    return await this.companyRepository.findOne({
      where: { id: company.id },
      relations: ['currency'],
    });
  }

  async createCompanyWithMember(id: string, body: CreateCompanyDTO) {
    const companyOwner = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });

    if (!companyOwner) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const companyOwnerCompany = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const selectedCurrency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });

    if (!selectedCurrency) {
      throw new HttpException(COMPANY_ERRORS.currency, HttpStatus.NOT_FOUND);
    }

    const companyOwnerAccounts = await this.memberRepository.find({
      where: { company: { id: companyOwnerCompany.id } },
      relations: ['user'],
    });

    if (!companyOwnerAccounts.length) {
      throw new HttpException('ACCOUNTS NOT FOUND', HttpStatus.NOT_FOUND);
    }

    await this.companyRepository.update(companyOwnerCompany.id, {
      currency: selectedCurrency,
      name: body.name || 'Default',
      date_format: body.date_format,
    });

    let companyOwnerAcc = null;
    let company_member_account = null;

    companyOwnerAccounts.map((acc) =>
      acc.role === ECompanyRoles.owner
        ? (companyOwnerAcc = acc)
        : (company_member_account = acc),
    );

    if (!companyOwner.active_account) {
      await this.authRepository.update(id, {
        active_account: companyOwnerAcc.id,
      });
    }

    const userInvitor = await this.authRepository.findOne({
      where: { id: company_member_account.user.id },
    });

    if (!userInvitor) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    if (!userInvitor.active_account) {
      await this.authRepository.update(userInvitor.id, {
        active_account: company_member_account.id,
      });
    }

    return {
      company: await this.companyRepository.findOne({
        where: { id: companyOwnerCompany.id },
        relations: ['currency'],
      }),
      user: await this.authRepository.findOne({
        where: { id: companyOwner.id },
        relations: ['accounts'],
      }),
    };
  }

  async getAllCompanyInvitations(id: string, body: PaginationDTO) {
    const userInvitor = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });

    if (!userInvitor) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const accountsIds = (
      await Promise.all(
        userInvitor.accounts.map((acc) =>
          this.memberRepository.findOne({
            where: { id: acc.id },
            relations: ['memberInvite'],
          }),
        ),
      )
    )
      .filter((acc) => acc.memberInvite)
      .map((acc) => acc.id);

    const [result, total] = await this.memberInvitesRepository.findAndCount({
      where: {
        email: Like(`%${body.search || ''}%`),
        members: { id: In(accountsIds) },
        isCompanyInvite: true,
      },
      relations: ['members'],
      order: { created: 'DESC' },
      take: body.take ?? 10,
      skip: body.skip ?? 0,
    });

    return {
      data: result,
      count: total,
    };
  }

  async createCompany(id: string, body: CreateCompanyDTO, logo): Promise<any> {
    if (body.withAccountant) {
      return await this.createCompanyWithMember(id, body);
    }

    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }

    const user_accounts = await Promise.all(
      user.accounts.map(
        async (acc) =>
          await this.memberRepository.findOne({
            where: { id: acc.id },
            relations: ['company'],
          }),
      ),
    );

    const existed_company = user_accounts.find(
      (item) => item.company.name === body.name,
    );
    if (existed_company) {
      throw new HttpException(
        COMPANY_ERRORS.existed_company,
        HttpStatus.CONFLICT,
      );
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
      userInvitorName: user.fullName,
      company: { id: company.id },
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

    if (!!logo) {
      return {
        company: await this.setCompanyLogo(logo, company.id),
        user: await this.authRepository.findOne({
          where: { id: user.id },
          relations: ['accounts'],
        }),
      };
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

  async changeCompanyLogo(id: string, file, active_account?: string) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    if (!file) {
      throw new HttpException('NO LOGO FILE', HttpStatus.FORBIDDEN);
    }
    return await this.setCompanyLogo(file, company.id);
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

  async updateCompany(
    companyId: string,
    body: UpdateCompanyDTO,
    logo,
  ): Promise<CompanyEntity> {
    const { name, isDeleteLogo } = body;
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException(COMPANY_ERRORS.company, HttpStatus.NOT_FOUND);
    }
    await this.companyRepository.update(company.id, {
      name: name,
    });

    if (!!isDeleteLogo) {
      try {
        await this.s3Service.deleteFile(`${company.id}/logo/${company.logo}`);
      } catch (e) {
        console.log(e);
        throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
      }
      await this.companyRepository.update(company.id, {
        logo: null,
      });
    }
    if (!!logo) {
      return await this.setCompanyLogo(logo, company.id);
    }
    return await this.companyRepository.findOne({ where: { id: company.id } });
  }

  async getCompanyLogo(companyId: string, res) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException('COMPANY DOES NOT EXIST', HttpStatus.NOT_FOUND);
    }
    if (!company.logo) {
      throw new HttpException('COMPANY HAS NO LOGO', HttpStatus.NOT_FOUND);
    }
    try {
      const readStream = await this.s3Service.getFilesStream(
        `${company.id}/logo/${company.logo}`,
      );
      readStream.pipe(res);
    } catch (e) {
      console.log(e);
      throw new HttpException('LOGO NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async deleteCompanyLogo(companyId) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.NOT_FOUND);
    }
    try {
      await this.s3Service.deleteFile(`${companyId}/logo/${company.logo}`);
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
    return 'Company Logo was deleted';
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

  async getManyCompanies(id: string, body: PaginationDTO) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException(COMPANY_ERRORS.user, HttpStatus.BAD_REQUEST);
    }
    const accounts = user.accounts.map((acc) => acc.id);
    const [result, total] = await this.companyRepository.findAndCount({
      where: {
        name: Like(`%${body.search || ''}%`),
        members: { id: In(accounts) },
      },
      relations: ['members'],
      order: { created: 'DESC' },
      take: body.take ?? 10,
      skip: body.skip ?? 0,
    });
    return {
      data: result,
      count: total,
    };
  }

  async getCompanyMembers(
    id: string,
    body: PaginationDTO,
  ): Promise<{
    data: MemberEntity[];
    count: number;
  }> {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [result, total] = await this.memberRepository.findAndCount({
      relations: ['company', 'user', 'memberInvite'],
      select: {
        company: { id: true, date_format: true, name: true },
      },
      where: {
        company: { id: company.id },
        name: Like(`%${body.search || ''}%`),
      },
      order: { created: 'DESC' },
      take: body.take ?? 10,
      skip: body.skip ?? 0,
    });
    return {
      data: result,
      count: total,
    };
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
      relations: ['receipts', 'members'],
    });
    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.NOT_FOUND);
    }

    // SET DIFFERENT ACTIVE_ACCOUNT FOR USERS IN COMPANY
    const accounts = await this.memberRepository.find({
      where: { company: { id: company.id } },
      relations: ['user'],
    });
    const accountsPromises = await accounts.map(async (acc) => {
      return {
        ...acc,
        user: await this.authRepository.findOne({
          where: { id: acc.user.id },
          relations: ['accounts'],
        }),
      };
    });
    const accWithUsers = await Promise.all(accountsPromises);
    if (accWithUsers) {
      const promises = accWithUsers.map(async (acc) => {
        if (acc.user.active_account === acc.id) {
          if (acc.user.accounts.length > 1) {
            await this.authRepository.update(acc.user.id, {
              active_account: acc.user.accounts.filter(
                (account) => account.id !== acc.id,
              )[0].id,
            });
          } else {
            await this.authRepository.update(acc.user.id, {
              active_account: '',
            });
          }
        }
      });
      await Promise.all(promises);
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
