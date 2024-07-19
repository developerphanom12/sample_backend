import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Raw, Repository } from 'typeorm';
import { CustomerAccEntity } from './entities/customeracc.entity';
import { CustomerAction } from 'aws-sdk/clients/ioteventsdata';
import { CustomerAccDto } from './dto/create-customeracc.dto';
import { UpdateCustomerAccDTO } from './dto/update-customeracc.dto';
import { PaginationDTO } from './dto/pagination.dto';

@Injectable()
export class CustomerAccService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(CustomerAccEntity)
    private customeraccRepository: Repository<CustomerAccEntity>,
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
      relations: ['sales', 'currency', 'customeraccount'],
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
      relations: ['sales', 'currency', 'customeraccount'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  private async extractCreator(id: string) {
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

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'THIS ACCOUNT HAS NO PERMISSIONS TO CREATE SUPPLIER',
        HttpStatus.BAD_REQUEST,
      );
    }
    return account;
  }

  async createSupplier(id: string, body: CustomerAccDto) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const creator = await this.extractCreator(id);

    const customerAcc = await this.customeraccRepository.save({
      name: body.name,
      company: { id: company.id },
      creator: creator,
    });
    return await this.customeraccRepository.findOne({
      where: { id: customerAcc.id },
      relations: ['creator'],
    });
  }


  async updateSupplier(id: string, body: UpdateCustomerAccDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const customnerId = body.id;
    if (!customnerId) {
      throw new HttpException(
        'REQUEST SHOULD CONTAIN SUPPLIER ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    const customer = await this.customeraccRepository.findOne({
      where: {
        id: customnerId,
        company: { id: company.id },
      },
    });
    if (!customer) {
      throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.NOT_FOUND);
    }
    await this.customeraccRepository.update(customer.id, {
      name: body.name,
      purchase:body.purchase
    });

    return await this.customeraccRepository.findOne({
      where: {
        id: customnerId,
        company: { id: company.id },
      },
    });
  }


  async getSupplierDetails(
    id: string,
    customerId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.customeraccRepository.findOne({
      where: { id: customerId, company: { id: company.id } },
      relations: ['sales', 'company', 'creator'],
    });
  }

  async getAllSuppliers(id: string, active_account: string) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.customeraccRepository.find({
      where: {
        company: { id: company.id },
      },
      relations: ['creator'],
    });
  }

  async getSuppliers(id: string, body: PaginationDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [result, total] = await this.customeraccRepository.findAndCount({
      relations: ['creator'],
      where: {
        company: { id: company.id },
        name: Raw(
          (alias) =>
            `LOWER(${alias}) Like '%${body?.search?.toLowerCase() || ''}%'`,
        ),
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

  async deleteSupplier(
    id: string,
    customerId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    if (!company.customeraccount) {
      throw new HttpException(
        'NO Customer IN COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    const supplier = await this.customeraccRepository.findOne({
      where: { id: customerId, company: { id: company.id } },
    });

    if (!supplier) {
      throw new HttpException('Customer NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.customeraccRepository.remove(supplier);
      return 'Customer DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}