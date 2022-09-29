import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Like, Repository } from 'typeorm';
import { CreateSupplierDTO } from './dto/create-supplier.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { SupplierEntity } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(SupplierEntity)
    private supplierRepository: Repository<SupplierEntity>,
    private configService: ConfigService,
  ) {}
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
      relations: ['receipts', 'currency', 'suppliersAccounts'],
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

  async createSupplier(id: string, body: CreateSupplierDTO) {
    const company = await this.extractCompanyFromUser(id);
    const creator = await this.extractCreator(id);

    const supplier = await this.supplierRepository.save({
      name: body.name,
      company: { id: company.id },
      creator: creator,
    });
    return await this.supplierRepository.findOne({
      where: { id: supplier.id },
      relations: ['creator'],
    });
  }

  async updateSupplier(id, body) {
    const company = await this.extractCompanyFromUser(id);
    const supplierId = body.id;
    if (!supplierId) {
      throw new HttpException(
        'REQUEST SHOULD CONTAIN SUPPLIER ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    const supplier = await this.supplierRepository.findOne({
      where: {
        id: supplierId,
        company: { id: company.id },
      },
    });
    if (!supplier) {
      throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.NOT_FOUND);
    }
    await this.supplierRepository.update(supplier.id, {
      ...body,
    });

    return await this.supplierRepository.findOne({
      where: {
        id: supplierId,
        company: { id: company.id },
      },
    });
  }

  async getAllSuppliers(id: string) {
    const company = await this.extractCompanyFromUser(id);

    return await this.supplierRepository.find({
      where: {
        company: { id: company.id },
      },
      relations: ['creator'],
    });
  }

  async getSuppliers(id: string, body: PaginationDTO) {
    const company = await this.extractCompanyFromUser(id);
    const [result, total] = await this.supplierRepository.findAndCount({
      relations: ['creator'],
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

  async getSupplierDetails(id: string, supplierId: string) {
    const company = await this.extractCompanyFromUser(id);
    return await this.supplierRepository.findOne({
      where: { id: supplierId, company: { id: company.id } },
      relations: ['receipts', 'company', 'creator'],
    });
  }

  async deleteSupplier(id: string, supplierId: string) {
    const company = await this.extractCompanyFromUser(id);

    if (!company.suppliersAccounts) {
      throw new HttpException(
        'NO SUPPLIERS IN COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, company: { id: company.id } },
    });

    if (!supplier) {
      throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.supplierRepository.remove(supplier);
      return 'SUPPLIER DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
