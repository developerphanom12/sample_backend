import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
} from 'src/heplers/receipt.helper';
import { EReceiptStatus, receiptPhotoPath } from './receipt.constants';
import { join } from 'path';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(ReceiptEntity)
    private receiptRepository: Repository<ReceiptEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
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

  async getImageData(photo, textractClient) {
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
      const test = await this.extractData(lines, photo.filename);

      return test;
    } catch (err) {
      console.log('Error', err);
      return {
        status: EReceiptStatus.declined,
        photos: [photo.filename],
      };
    }
  }

  async saveReceipt(receiptData, description: string, company: AuthEntity, currency: CurrencyEntity) {

    try {
      return await this.receiptRepository.save({
        ...receiptData,
        description: description,
        currency: currency,
        company: company,
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
    };

    if (!(receiptData.receipt_date || receiptData.total || receiptData.tax)) {
      return {
        ...receiptData,
        status: EReceiptStatus.declined,
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
    const company = await this.authRepository.findOne({
      where: { id: id },
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    const currency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });

    const textractClient = await this.createTextractClient();

    const promises = photos.map((photo) =>
      this.getImageData(photo, textractClient),
    );

    const textractData = await Promise.all(promises);

    const generateReceipt = textractData.map((receiptData) =>
      this.saveReceipt(receiptData, body.description, company, currency),
    );

    const createdReceipts = await Promise.all(generateReceipt);

    return await createdReceipts;
  }

  async getReceipts(id: string, paginationParameters: PaginationDTO) {
    const company = await this.authRepository.findOne({
      where: { id: id },
      relations: ['receipts'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    const [result, total] = await this.receiptRepository.findAndCount({
      where: { company: company },
      order: { created: 'DESC' },
      take: paginationParameters.take ?? 10,
      skip: paginationParameters.skip ?? 0,
      relations: ['currency'],
    });
    return {
      data: result,
      count: total,
    };
  }

  async updateReceipt(id: string, body) {
    const receiptId = body.id;
    const company = await this.authRepository.findOne({
      where: { id: id },
      relations: ['receipts'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    if (!company.receipts) {
      throw new HttpException('NO RECEIPTS IN COMPANY', HttpStatus.BAD_REQUEST);
    }

    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
      relations: ['company'],
    });

    if (!receipt) {
      throw new HttpException('RECEIPT NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    if (receipt.company.id !== company.id) {
      throw new HttpException(
        'CAN`T EDIT RECEIPT FOR DIFFERENT COMPANY',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.receiptRepository.update(receiptId, {
      ...body,
    });
    return await this.receiptRepository.findOne({
      where: { id: receiptId },
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
    const company = await this.authRepository.findOne({
      where: { id: id },
      relations: ['receipts'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    if (!company.receipts) {
      throw new HttpException('NO RECEIPTS IN COMPANY', HttpStatus.BAD_REQUEST);
    }

    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new HttpException('RECEIPT NOT FOUND', HttpStatus.BAD_REQUEST);
    }

    if (company.id !== receipt.id) {
      throw new HttpException(
        'CANT DELETE RECEIPT FOR DIFFERENT COMPANY',
        HttpStatus.BAD_REQUEST,
      );
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
