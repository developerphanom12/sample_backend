import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Raw, Repository } from 'typeorm';
import { PaginationDTO } from './dto/pagination.dto';
import { SupplierAccEntity } from './entities/suppliernew.entity';
import { CreateSupplierAccDTO } from './dto/create-suppliernew.dto';
import { UpdateSupplierAccDTO } from './dto/update-suppliernew.dto';

@Injectable()
export class SupplierAccService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(SupplierAccEntity)
    private supplierAccRepository: Repository<SupplierAccEntity>,
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
      relations: ['receipts', 'currency', 'suppliersAccAccounts'],
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
      relations: ['receipts', 'currency', 'suppliersAccAccounts'],
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

  async createSupplier(id: string, body: CreateSupplierAccDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const creator = await this.extractCreator(id);

    const supplier = await this.supplierAccRepository.save({
      name: body.name,
      purchase_invoice:body.purchase_invoice,
      company: { id: company.id },
      creator: creator,
    });
    return await this.supplierAccRepository.findOne({
      where: { id: supplier.id },
      relations: ['creator'],
    });
  }

  async updateSupplier(id: string, body: UpdateSupplierAccDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const supplierId = body.id;
    if (!supplierId) {
      throw new HttpException(
        'REQUEST SHOULD CONTAIN SUPPLIER ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    const supplier = await this.supplierAccRepository.findOne({
      where: {
        id: supplierId,
        company: { id: company.id },
      },
    });
    if (!supplier) {
      throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.NOT_FOUND);
    }
    await this.supplierAccRepository.update(supplier.id, {
      name: body.name,
      purchase_invoice:body.purchase_invoice
    });

    return await this.supplierAccRepository.findOne({
      where: {
        id: supplierId,
        company: { id: company.id },
      },
    });
  }

  async getAllSuppliers(id: string, active_account: string) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.supplierAccRepository.find({
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

    const [result, total] = await this.supplierAccRepository.findAndCount({
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

  async getSupplierDetails(
    id: string,
    supplierId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.supplierAccRepository.findOne({
      where: { id: supplierId, company: { id: company.id } },
      relations: ['receipts', 'company', 'creator'],
    });
  }

  async deleteSupplier(
    id: string,
    supplierId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    if (!company.suppliersAccAccounts) {
      throw new HttpException(
        'NO SUPPLIER IN COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    const supplier = await this.supplierAccRepository.findOne({
      where: { id: supplierId, company: { id: company.id } },
    });

    if (!supplier) {
      throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.supplierAccRepository.remove(supplier);
      return 'SUPPLIER DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
