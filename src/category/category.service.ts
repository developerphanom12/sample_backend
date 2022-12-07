import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Like, Repository } from 'typeorm';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
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
        'THIS ACCOUNT HAS NO PERMISSIONS TO CREATE CATEGORY',
        HttpStatus.BAD_REQUEST,
      );
    }
    return account;
  }

  async createCategory(id: string, body: CreateCategoryDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const creator = await this.extractCreator(id);

    const category = await this.categoryRepository.save({
      name: body.name,
      company: { id: company.id },
      creator: creator,
    });
    return await this.categoryRepository.findOne({
      where: { id: category.id },
      relations: ['creator'],
    });
  }

  async updateCategory(id: string, body: UpdateCategoryDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const categoryId = body.id;
    if (!categoryId) {
      throw new HttpException(
        'REQUEST SHOULD CONTAIN CATEGORY ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        company: { id: company.id },
      },
    });

    if (!category) {
      throw new HttpException('CATEGORY NOT FOUND', HttpStatus.NOT_FOUND);
    }
    await this.categoryRepository.update(category.id, {
      name: body.name,
    });

    return await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        company: { id: company.id },
      },
    });
  }

  async getAllCategories(id: string, active_account?: string) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    return await this.categoryRepository.find({
      where: { company: { id: company.id } },
      relations: ['creator'],
    });
  }

  async getCategories(id: string, body: PaginationDTO) {
    const company = body.active_account
      ? await this.extractCompanyFromActiveAccount(body.active_account)
      : await this.extractCompanyFromUser(id);

    const [result, total] = await this.categoryRepository.findAndCount({
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

  async getCategoryDetails(
    id: string,
    categoryId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);
    return await this.categoryRepository.findOne({
      where: { id: categoryId, company: { id: company.id } },
      relations: ['receipts', 'company', 'creator'],
    });
  }

  async deleteCategory(
    id: string,
    categoryId: string,
    active_account?: string,
  ) {
    const company = active_account
      ? await this.extractCompanyFromActiveAccount(active_account)
      : await this.extractCompanyFromUser(id);

    if (!company.categories) {
      throw new HttpException(
        'NO CATEGORIES IN COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, company: { id: company.id } },
    });

    if (!category) {
      throw new HttpException('CATEGORY NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.categoryRepository.remove(category);
      return 'CATEGORY DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
