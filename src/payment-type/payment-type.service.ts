import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Like, Repository } from 'typeorm';
import { CreatePaymentTypeDTO } from './dto/create-payment-type.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePaymentTypeDTO } from './dto/update-payment-type.dto';
import { PaymentTypeEntity } from './entities/payment-type.entity';

@Injectable()
export class PaymentTypeService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(PaymentTypeEntity)
    private paymentTypeRepository: Repository<PaymentTypeEntity>,
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
      relations: ['receipts', 'currency', 'payment_types'],
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
      relations: ['receipts', 'currency', 'payment_types'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  private async extractCreator(id: string, active_account: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }
    const account = await this.memberRepository.findOne({
      where: { id: active_account || user.active_account },
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
        'THIS ACCOUNT HAS NO PERMISSIONS TO CREATE PAYMENT TYPE',
        HttpStatus.BAD_REQUEST,
      );
    }
    return account;
  }

  async createPaymentType(id: string, body: CreatePaymentTypeDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const creator = await this.extractCreator(id, body.active_account);

    const paymentType = await this.paymentTypeRepository.save({
      name: body.name,
      company: { id: company.id },
      creator: creator,
    });
    return await this.paymentTypeRepository.findOne({
      where: { id: paymentType.id },
      relations: ['creator'],
    });
  }

  async updatePaymentType(id: string, body: UpdatePaymentTypeDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const paymentTypeId = body.id;
    if (!paymentTypeId) {
      throw new HttpException(
        'REQUEST SHOULD CONTAIN PAYMENT TYPE ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentType = await this.paymentTypeRepository.findOne({
      where: {
        id: paymentTypeId,
        company: { id: company.id },
      },
    });
    if (!paymentType) {
      throw new HttpException('PAYMENT TYPE NOT FOUND', HttpStatus.NOT_FOUND);
    }
    await this.paymentTypeRepository.update(paymentType.id, {
      name: body.name,
    });

    return await this.paymentTypeRepository.findOne({
      where: {
        id: paymentTypeId,
        company: { id: company.id },
      },
    });
  }

  async getAllPaymentTypes(id: string, active_account?: string) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.paymentTypeRepository.find({
      where: { company: { id: company.id } },
      relations: ['creator'],
    });
  }

  async getPaymentTypes(id: string, body: PaginationDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [result, total] = await this.paymentTypeRepository.findAndCount({
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

  async getPaymentTypeDetails(
    id: string,
    paymentTypeId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.paymentTypeRepository.findOne({
      where: { id: paymentTypeId, company: { id: company.id } },
      relations: ['receipts', 'company', 'creator'],
    });
  }

  async deletePaymentType(
    id: string,
    paymentTypeId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    if (!company.payment_types) {
      throw new HttpException(
        'NO PAYMENT TYPES IN COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    const paymentType = await this.paymentTypeRepository.findOne({
      where: { id: paymentTypeId, company: { id: company.id } },
    });

    if (!paymentType) {
      throw new HttpException('PAYMENT TYPE NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.paymentTypeRepository.remove(paymentType);
      return 'PAYMENT TYPE DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
