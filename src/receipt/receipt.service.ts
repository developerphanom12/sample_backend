import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository, LessThan } from 'typeorm';
import { ReceiptEntity } from './entities/receipt.entity';
import {
  AnalyzeDocumentCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import * as fs from 'fs';
import {
  extractDate,
  extractTax,
  extractTotal,
} from '../heplers/receipt.helper';
import { EReceiptStatus, receiptPhotoPath } from './receipt.constants';
import { join } from 'path';
import { AuthEntity } from '../auth/entities/auth.entity';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(ReceiptEntity)
    private receiptRepository: Repository<ReceiptEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(SupplierEntity)
    private supplierRepository: Repository<SupplierEntity>,
    private configService: ConfigService,
  ) {}

  private async createTextractClient() {
    const textractClient = new TextractClient({
      credentials: {
        accessKeyId: this.configService.get('AWS_SES_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SES_SECRET_ACCESS_KEY'),
      },
      region: 'eu-west-2',
    });
    return textractClient;
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
      relations: ['receipts', 'currency'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  async getImageData(photo, customId: number, textractClient) {
    try {
      const buf = await fs.promises.readFile(photo.path);
      const params = {
        Document: {
          Bytes: buf,
        },
        FeatureTypes: ['TABLES', 'FORMS'],
      };
      const analyzeDoc = new AnalyzeDocumentCommand(params);
      const response = await textractClient.send(analyzeDoc);
      const lines = response.Blocks.filter((b) => b.BlockType === 'LINE').map(
        (i) => i.Text,
      );
      const data = await this.extractData(lines, photo.filename);
      return {
        ...data,
        custom_id: `rc${customId + 1}`,
      };
    } catch (err) {
      console.log('Error', err);
      return {
        status: EReceiptStatus.rejected,
        custom_id: `rc${customId + 1}`,
        photos: [photo.filename],
      };
    }
  }

  async saveReceipt(
    receiptData,
    description: string,
    company: CompanyEntity,
    currency: CurrencyEntity,
  ) {
    try {
      const receipt = await this.receiptRepository.save({
        ...receiptData,
        description: description,
        currency: currency,
        company: company,
      });
      return await this.receiptRepository.findOne({
        where: { id: receipt.id },
        relations: ['currency', 'company'],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async extractData(textData: string[], photo: string) {
    const text = textData.join(' ').toLocaleLowerCase();

    const receiptData = {
      receipt_date: extractDate(text),
      tax: extractTax(text),
      total: extractTotal(text),
      net: null,
      vat_code: null,
    };
    if (receiptData.total && receiptData.tax) {
      receiptData.net = receiptData.total - receiptData.tax;
      receiptData.vat_code =
        Math.floor(
          (receiptData.tax / (receiptData.total - receiptData.tax)) * 10000,
        ) /
          100 +
        '%';
    }

    if (!(receiptData.receipt_date || receiptData.total || receiptData.tax)) {
      return {
        ...receiptData,
        status: EReceiptStatus.rejected,
        photos: [photo],
      };
    }
    return {
      ...receiptData,
      status: EReceiptStatus.review,
      photos: [photo],
    };
  }

  async createReceipt(id: string, body: CreateReceiptDTO, photos) {
    const company = await this.extractCompanyFromUser(id);

    const currency = await this.currencyRepository.findOne({
      where: { id: company.currency.id },
    });

    const receipts = await this.receiptRepository.find({
      where: { company: company },
    });

    const textractClient = await this.createTextractClient();

    const promises = photos.map((photo, i) =>
      this.getImageData(
        photo,
        (receipts ? receipts.length : 0) + i,
        textractClient,
      ),
    );

    const textractData = await Promise.all(promises);

    const generateReceipt = textractData.map((receiptData) =>
      this.saveReceipt(receiptData, body.description, company, currency),
    );

    const createdReceipts = await Promise.all(generateReceipt);

    return await createdReceipts;
  }

  async getReceipts(id: string, body: PaginationDTO) {
    const company = await this.extractCompanyFromUser(id);

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const nextDay = new Date(
      new Date(today).setDate(new Date(today).getDate() + 1),
    );

    const dateFilter =
      body.date_start && body.date_end
        ? Between(body.date_start, body.date_end)
        : LessThan(nextDay);

    const [result, total] = await this.receiptRepository.findAndCount({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: [
        {
          company: company,
          status: Like(`%${body.status || ''}%`),
          created: dateFilter,
          custom_id: Like(`%${body.search || ''}%`),
        },
        {
          company: company,
          status: Like(`%${body.status || ''}%`),
          created: dateFilter,
          supplier: {
            name: Like(`%${body.search || ''}%`),
          },
        },
        {
          company: company,
          status: Like(`%${body.status || ''}%`),
          created: dateFilter,
          category: {
            name: Like(`%${body.search || ''}%`),
          },
        },
        {
          company: company,
          status: Like(`%${body.status || ''}%`),
          created: dateFilter,
          payment_type: {
            name: Like(`%${body.search || ''}%`),
          },
        },
      ],
      order: { created: 'DESC' },
      take: body.take ?? 10,
      skip: body.skip ?? 0,
    });
    return {
      data: result,
      count: total,
    };
  }

  async updateReceipt(id: string, body: UpdateReceiptDTO) {
    const receiptId = body.id;
    const company = await this.extractCompanyFromUser(id);

    if (!company.receipts) {
      throw new HttpException('NO RECEIPTS IN COMPANY', HttpStatus.BAD_REQUEST);
    }

    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId, company: company.id },
    });

    if (!receipt) {
      throw new HttpException('RECEIPT NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    const isCurrencyChanged =
      body.currency && body.currency !== receipt.currency.id;

    const payload = JSON.parse(
      JSON.stringify({
        ...body,
        id: undefined,
        currency: undefined,
      }),
    );

    await this.receiptRepository.update(receiptId, {
      ...payload,
    });

    if (isCurrencyChanged) {
      const currency = await this.currencyRepository.findOne({
        where: { id: body.currency },
      });
      if (!currency) {
        throw new HttpException('CURRENCY NOT FOUND', HttpStatus.NOT_FOUND);
      }
      await this.receiptRepository.update(receiptId, {
        currency: currency,
      });
    }

    return await this.receiptRepository.findOne({
      where: { id: receiptId },
      relations: ['currency', 'supplier', 'category', 'payment_type'],
    });
  }

  async getReceiptDetails(imagename: string, res) {
    try {
      const image = await res.sendFile(
        join(process.cwd(), `${receiptPhotoPath}/` + imagename),
      );
      return image;
    } catch (e) {
      throw new HttpException('GETTING IMAGE ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteImage(imagename: string) {
    await fs.unlink(
      join(process.cwd(), `${receiptPhotoPath}/` + imagename),
      (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      },
    );
    return 'Success';
  }

  async receiptDelete(id: string, receiptId: string) {
    const company = await this.extractCompanyFromUser(id);

    if (!company.receipts) {
      throw new HttpException('NO RECEIPTS IN COMPANY', HttpStatus.BAD_REQUEST);
    }

    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId, company: company.id },
    });

    if (!receipt) {
      throw new HttpException('RECEIPT NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    receipt.photos.forEach((el) => this.deleteImage(el));
    try {
      await this.receiptRepository.remove(receipt);
      return 'RECEIPT DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }
}
