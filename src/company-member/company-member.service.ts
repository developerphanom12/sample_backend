import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Repository } from 'typeorm';
import { ECompanyRoles } from './company-member.constants';
import { CreateCompanyAccountDTO } from './dto/create-account.dto';
import { UpdateCompanyAccountDTO } from './dto/update-account.dto';
import { MemberEntity } from './entities/company-member.entity';

@Injectable()
export class CompanyMemberService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  private async extractUserAccount(id: string) {
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
    return account;
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
      relations: ['members'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  async selectActiveAccount(id: string, accountId: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.NOT_FOUND);
    }
    const account = await this.memberRepository.findOne({
      where: { id: accountId },
      relations: ['user', 'company'],
    });
    if (!account) {
      throw new HttpException('ACCOUNT DOES NOT EXIST', HttpStatus.NOT_FOUND);
    }

    if (account.user.id !== user.id) {
      throw new HttpException(
        'USER HASN`T ACCESS TO THIS ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.authRepository.update(user.id, {
      active_account: account.id,
    });

    return {
      user: await this.authRepository.findOne({
        where: { id: user.id },
        relations: ['accounts'],
      }),
      company: await this.companyRepository.findOne({
        where: { id: account.company.id },
      }),
    };
  }

  async getUserAccounts(id: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }

    if (!user.accounts || user.accounts.length < 1) {
      return null;
    }

    const promises = user.accounts.map(
      async (account) =>
        await this.memberRepository.findOne({
          where: { id: account.id },
          relations: ['company'],
        }),
    );
    const result = await Promise.all(promises);
    return await result;
  }

  async createCompanyMember(id: string, body: CreateCompanyAccountDTO) {
    const company = await this.extractCompanyFromUser(id);
    const account = await this.extractUserAccount(id);

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR CREATE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const existUser = await this.authRepository.findOne({
      where: { email: body.email.toLocaleLowerCase() },
      relations: ['accounts'],
    });

    if (!existUser) {
      throw new HttpException(
        `USER WITH EMAIL ${body.email} IS NOT EXIST`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userAccounts = existUser.accounts.map((acc) =>
      this.memberRepository.findOne({
        where: { id: acc.id },
        relations: ['company'],
      }),
    );
    const userCompanies = await (
      await Promise.all(userAccounts)
    ).map((el) => el.company);

    if (userCompanies.filter((el) => el.id === company.id).length > 0) {
      throw new HttpException(
        `USER ALREADY HAVE ACCOUNT FOR THIS COMPANY`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newMember = await this.memberRepository.save({
      name: body.name || existUser.fullName,
      role: body.role,
      user: existUser,
      company: { id: company.id },
    });

    return newMember;
  }

  async deleteCompanyMember(id: string, accountId: string) {
    const company = await this.extractCompanyFromUser(id);
    const account = await this.extractUserAccount(id);

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR DELETE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const deletingUser = await this.memberRepository.findOne({
      where: {
        id: accountId,
        company: { id: company.id },
      },
      relations: ['company'],
    });

    if (deletingUser.role === ECompanyRoles.owner) {
      throw new HttpException(
        'CANT DELETE COMPANY OWNER',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.memberRepository.delete(deletingUser.id);
    return {
      message: 'The account has been deleted',
    };
  }

  async updateCompanyMember(
    id: string,
    accountId: string,
    body: UpdateCompanyAccountDTO,
  ) {
    const company = await this.extractCompanyFromUser(id);
    const account = await this.extractUserAccount(id);

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR UPDATE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const updateUser = await this.memberRepository.findOne({
      where: { id: accountId },
      relations: ['company'],
    });

    if (
      account.id === updateUser.id ||
      !(updateUser.role === ECompanyRoles.owner)
    ) {
      await this.memberRepository.update(updateUser.id, { ...body });
      return await this.memberRepository.findOne({
        where: { id: updateUser.id },
      });
    }
    throw new HttpException(
      'YOU HAVE NO PERMISSION TO EDIT COMPANY OWNER',
      HttpStatus.FORBIDDEN,
    );
  }
}
