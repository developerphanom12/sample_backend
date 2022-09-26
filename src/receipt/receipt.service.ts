import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, IsNull, Like, Repository, LessThan, In } from 'typeorm';
import { ReceiptEntity } from './entities/receipt.entity';
import {
  extractCurrency,
  extractDate,
  extractNet,
  extractTax,
  extractTotal,
  extractVat,
} from '../heplers/receipt.helper';
import { EReceiptStatus, IFilters } from './receipt.constants';
import { AuthEntity } from '../auth/entities/auth.entity';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { S3Service } from 'src/s3/s3.service';
import { DownloadCSVDTO } from './dto/download-csv.dto';
import { DownloadService } from 'src/download/download.service';
import { SendReceiptEmailDTO } from './dto/send-receipt-email.dto';
import * as fs from 'fs';
import { EmailsService } from 'src/emails/emails.service';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';
import { ECompanyRoles } from 'src/company-member/company-member.constants';

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
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(SupplierEntity)
    private supplierRepository: Repository<SupplierEntity>,
    @InjectRepository(PaymentTypeEntity)
    private paymentTypeRepository: Repository<PaymentTypeEntity>,
    private configService: ConfigService,
    private s3Service: S3Service,
    private downloadService: DownloadService,
    private emailsService: EmailsService,
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
      relations: ['receipts', 'currency'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  async getImageData(
    photo,
    customId: number,
    companyId: string,
    userRole: ECompanyRoles,
  ) {
    const photoPath = await this.uploadPhotoToBucket(photo, companyId);
    try {
      const textractImage = await this.s3Service.textractFile(photoPath);
      const imageName = photoPath.key.split('/')[2];
      const data = await this.extractData(textractImage, imageName, userRole);

      return {
        ...data,
        custom_id: `rc${customId}`,
      };
    } catch (err) {
      console.log('Error', err);
      return {
        status: EReceiptStatus.rejected,
        custom_id: `rc${customId}`,
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
      const findedCurrency = receiptData.currency
        ? await this.currencyRepository.findOne({
            where: { country: receiptData.currency },
          })
        : currency;

      const receipt = await this.receiptRepository.save({
        ...receiptData,
        description: description,
        currency: findedCurrency,
        company: { id: company.id },
      });
      return await this.receiptRepository.findOne({
        where: { id: receipt.id },
        relations: ['currency', 'company'],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async extractData(
    textData: string[],
    photo: string,
    userRole: ECompanyRoles,
  ) {
    const text = textData.join(' ').toLocaleLowerCase();

    const receiptData = {
      receipt_date: extractDate(text),
      tax: extractVat(text),
      total: extractTotal(text),
      net: extractNet(text),
      vat_code: null,
      currency: extractCurrency(text),
    };

    if (receiptData.total && receiptData.tax && !receiptData.net) {
      receiptData.net = receiptData.total - receiptData.tax;
    }

    if (
      receiptData.total &&
      receiptData.tax &&
      (!receiptData.net || receiptData.net === receiptData.total)
    ) {
      receiptData.net = Math.abs(receiptData.total - receiptData.tax);
    }

    if (
      !(
        receiptData.receipt_date ||
        receiptData.total ||
        receiptData.tax ||
        receiptData.net
      )
    ) {
      return {
        ...receiptData,
        status: EReceiptStatus.rejected,
        photos: [photo],
      };
    }
    return {
      ...receiptData,
      status:
        userRole === ECompanyRoles.user
          ? EReceiptStatus.processing
          : EReceiptStatus.review,
      photos: [photo],
    };
  }

  async createReceipt(id: string, body: CreateReceiptDTO, photos) {
    const company = await this.extractCompanyFromUser(id);

    const activeAccount = await this.memberRepository.findOne({
      where: {
        id: (
          await this.authRepository.findOne({ where: { id: id } })
        ).active_account,
      },
    });

    const currency = await this.currencyRepository.findOne({
      where: { id: company.currency.id },
    });

    const receipts = await this.receiptRepository.find({
      where: { company: { id: company.id } },
    });

    const promises = photos.map((photo, i) => {
      const custom_id =
        (receipts.length > 0 &&
          +receipts[receipts.length - 1].custom_id.replace(/[^\d]/g, '')) +
          (i + 1) || i + 1;

      return this.getImageData(
        photo,
        custom_id,
        company.id,
        activeAccount.role,
      );
    });

    const textractData = await Promise.all(promises);

    const generateReceipt = textractData.map((receiptData) =>
      this.saveReceipt(receiptData, body.description, company, currency),
    );

    const createdReceipts = await Promise.all(generateReceipt);

    return await createdReceipts;
  }

  async uploadPhotoToBucket(file, companyId: string) {
    if (!file) {
      throw new HttpException('NO RECEIPT PHOTO', HttpStatus.BAD_REQUEST);
    }

    const folderName = `${companyId}/receipts`;
    const response = await this.s3Service.loadFile(file, folderName);

    return {
      link: response.location,
      key: response.key,
    };
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

    const filters = {
      company: { id: company.id },
      status: Like(`%${body.status || ''}%`),
      created: dateFilter,
    };

    if (!body.isMobile) {
      const [result, total] = await this.receiptRepository.findAndCount({
        relations: ['currency', 'supplier', 'category', 'payment_type'],
        where: [
          {
            ...filters,
            custom_id: Like(`%${body.search || ''}%`),
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

    const filerParams: IFilters = {
      company: { id: company.id },
      created: dateFilter,
      status: Like(`%${body.status || ''}%`),
    };

    const isCategoryFilter = body.hasOwnProperty('category');
    if (isCategoryFilter) {
      if (!body.category) {
        filerParams.category = null;
      } else {
        const category = await this.categoryRepository.findOne({
          where: { company: { id: company.id }, id: body.category },
        });
        if (!category) {
          throw new HttpException('CATEGORY NOT FOUND', HttpStatus.NOT_FOUND);
        }
        filerParams.category = { id: category.id };
      }
    }
    const isSupplierFilter = body.hasOwnProperty('supplier');
    if (isSupplierFilter) {
      if (!body.supplier) {
        filerParams.supplier = null;
      } else {
        const supplier = await this.supplierRepository.findOne({
          where: { company: { id: company.id }, id: body.supplier },
        });
        if (!supplier) {
          throw new HttpException('SUPPLIER NOT FOUND', HttpStatus.NOT_FOUND);
        }
        filerParams.supplier = { id: supplier.id };
      }
    }
    const isPaymentTypeFilter = body.hasOwnProperty('payment_type');
    if (isPaymentTypeFilter) {
      if (!body.payment_type) {
        filerParams.payment_type = null;
      } else {
        const payment_type = await this.paymentTypeRepository.findOne({
          where: { company: { id: company.id }, id: body.payment_type },
        });
        if (!payment_type) {
          throw new HttpException(
            'PAYMENT TYPE NOT FOUND',
            HttpStatus.NOT_FOUND,
          );
        }
        filerParams.payment_type = { id: payment_type.id };
      }
    }

    const [result, total] = await this.receiptRepository.findAndCount({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: {
        ...filerParams,
        custom_id: Like(`%${body.search || ''}%`),
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

  async updateReceipt(id: string, body: UpdateReceiptDTO) {
    const receiptId = body.id;
    const company = await this.extractCompanyFromUser(id);

    if (!company.receipts) {
      throw new HttpException('NO RECEIPTS IN COMPANY', HttpStatus.BAD_REQUEST);
    }

    const activeAccount = await this.memberRepository.findOne({
      where: {
        id: (
          await this.authRepository.findOne({ where: { id: id } })
        ).active_account,
      },
    });

    if (
      activeAccount.role === ECompanyRoles.user &&
      body.status === EReceiptStatus.accepted
    ) {
      throw new HttpException(
        'NO PERMISSON TO SET RECEIPT AS ACCEPTED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const receipt = await this.receiptRepository.findOne({
      relations: ['currency'],
      where: { id: receiptId, company: { id: company.id } },
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

  async markReceiptsAsPaid(id: string, body: DownloadCSVDTO) {
    const receiptsId: string[] = body.receipts;

    if (!receiptsId) {
      throw new HttpException('NO RECEIPTS ID', HttpStatus.FORBIDDEN);
    }
    const company = await this.extractCompanyFromUser(id);

    const receipts = await this.receiptRepository.find({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: {
        company: { id: company.id },
        id: In(receiptsId),
      },
    });

    if (!receipts || receipts.length < 1) {
      throw new HttpException('RECEIPTS NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.receiptRepository.update(
        receipts.map((r) => r.id),
        { payment_status: true },
      );
      return 'RECEIPTS WERE MARKED AS PAID';
    } catch (e) {
      throw new HttpException('MARK AS PAID ERROR', HttpStatus.FORBIDDEN);
    }
  }

  async getReceiptImage(id: string, image_name: string, res) {
    const company = await this.extractCompanyFromUser(id);
    try {
      const readStream = await this.s3Service.getFilesStream(
        `${company.id}/receipts/${image_name}`,
      );
      readStream.pipe(res);
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async deleteImage(id: string, image_name: string) {
    const company = await this.extractCompanyFromUser(id);
    try {
      await this.s3Service.deleteFile(`${company.id}/receipts/${image_name}`);
      return 'Image Delete Success';
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async receiptsDelete(id: string, body: DownloadCSVDTO) {
    const receiptsId: string[] = body.receipts;

    if (!receiptsId) {
      throw new HttpException('NO RECEIPTS ID', HttpStatus.FORBIDDEN);
    }
    const company = await this.extractCompanyFromUser(id);

    const receipts = await this.receiptRepository.find({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: {
        company: { id: company.id },
        id: In(receiptsId),
      },
    });

    if (!receipts || receipts.length < 1) {
      throw new HttpException('RECEIPTS NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    receipts.forEach((receipt) =>
      receipt.photos.forEach((el) => {
        this.s3Service.deleteFile(`${company.id}/receipts/${el}`);
      }),
    );

    try {
      await this.receiptRepository.remove(receipts);
      return 'RECEIPTS WERE DELETED';
    } catch (e) {
      throw new HttpException('DELETE ERROR', HttpStatus.FORBIDDEN);
    }
  }

  async downloadCSV(id: string, body: DownloadCSVDTO) {
    const receiptsId: string[] = body.receipts;
    if (!receiptsId) {
      throw new HttpException('NO RECEIPTS ID', HttpStatus.FORBIDDEN);
    }

    const company = await this.extractCompanyFromUser(id);

    const receipts = await this.receiptRepository.find({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: { company: { id: company.id }, id: In(receiptsId) },
      order: { custom_id: 'ASC' },
    });

    const exportedData = receipts.map((receipt) => {
      return {
        id: receipt.custom_id.toUpperCase(),
        date: receipt.receipt_date || null,
        supplier: receipt.supplier ? receipt.supplier.name : null,
        supplierAccount: receipt.supplier_account || null,
        category: receipt.category ? receipt.category.name : null,
        vatCode: receipt.vat_code || null,
        currency: receipt.currency ? receipt.currency.value : null,
        net: receipt.net || null,
        tax: receipt.tax || null,
        total: receipt.total || null,
        publish: receipt.publish_status,
        paid: receipt.payment_status,
        status: receipt.status,
      };
    });

    const fields = [
      'ID',
      'Date',
      'Supplier',
      'Supplier Account',
      'Category',
      'VAT code',
      'Currency',
      'Net',
      'Tax',
      'Total',
      'Publish',
      'Paid',
      'Status',
    ];

    return await this.downloadService.createCSV(exportedData, fields);
  }

  async downloadXLSX(id: string, body: DownloadCSVDTO) {
    const receiptsId: string[] = body.receipts;
    if (!receiptsId) {
      throw new HttpException('NO RECEIPTS ID', HttpStatus.FORBIDDEN);
    }

    const company = await this.extractCompanyFromUser(id);

    const receipts = await this.receiptRepository.find({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: { company: { id: company.id }, id: In(receiptsId) },
      order: { custom_id: 'ASC' },
    });

    const exportedData = receipts.map((receipt) => {
      return {
        id: receipt.custom_id.toUpperCase(),
        date: receipt.receipt_date || null,
        supplier: receipt.supplier ? receipt.supplier.name : null,
        supplierAccount: receipt.supplier_account || null,
        category: receipt.category ? receipt.category.name : null,
        vatCode: receipt.vat_code || null,
        currency: receipt.currency ? receipt.currency.value : null,
        net: receipt.net || null,
        tax: receipt.tax || null,
        total: receipt.total || null,
        publish: receipt.publish_status,
        paid: receipt.payment_status,
        status: receipt.status,
      };
    });

    const fields = [
      'ID',
      'Date',
      'Supplier',
      'Supplier Account',
      'Category',
      'VAT code',
      'Currency',
      'Net',
      'Tax',
      'Total',
      'Publish',
      'Paid',
      'Status',
    ];

    return await this.downloadService.createXLSX(exportedData, fields);
  }

  async sendEmail(id: string, body: SendReceiptEmailDTO) {
    const receiptsId: string[] = body.receipts;
    if (!receiptsId) {
      throw new HttpException('NO RECEIPTS ID', HttpStatus.FORBIDDEN);
    }

    const company = await this.extractCompanyFromUser(id);

    const receipts = await this.receiptRepository.find({
      relations: ['currency', 'supplier', 'category', 'payment_type'],
      where: { company: { id: company.id }, id: In(receiptsId) },
      order: { custom_id: 'ASC' },
    });

    const exportedData = receipts.map((receipt) => {
      return {
        id: receipt.custom_id.toUpperCase(),
        date: receipt.receipt_date || null,
        supplier: receipt.supplier ? receipt.supplier.name : null,
        supplierAccount: receipt.supplier_account || null,
        category: receipt.category ? receipt.category.name : null,
        vatCode: receipt.vat_code || null,
        currency: receipt.currency ? receipt.currency.value : null,
        net: receipt.net || null,
        tax: receipt.tax || null,
        total: receipt.total || null,
        publish: receipt.publish_status,
        paid: receipt.payment_status,
        status: receipt.status,
      };
    });

    const fields = [
      'ID',
      'Date',
      'Supplier',
      'Supplier Account',
      'Category',
      'VAT code',
      'Currency',
      'Net',
      'Tax',
      'Total',
      'Publish',
      'Paid',
      'Status',
    ];

    const user = await this.authRepository.findOne({
      where: { email: body.to.toLocaleLowerCase() },
    });

    const File = await this.downloadService.createXLSX(exportedData, fields);

    const payload = {
      name: user ? user.fullName : '',
      email: body.to,
      attachedFile: await this.getBase64(File),
      messageBody: body.message,
      subject: body.subject,
    };

    return await this.emailsService.sendEmailXLSX(payload);
  }

  async getBase64(file) {
    return await fs.readFileSync(file, 'base64');
  }
}
