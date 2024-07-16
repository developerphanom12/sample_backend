import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDTO } from '../auth/dto/login.dto';
import { AuthEntity } from '../auth/entities/auth.entity';
import { EXPIRE_CAPIUM_JWT_TIME } from '../constants/jwt';
import { IRHconnect } from './receipt-hub-connect.types';
import { S3Service } from '../s3/s3.service';
import {
  extractCurrency,
  extractDate,
  extractNet,
  extractSupplier,
  extractTotal,
  extractVat,
} from '../heplers/receipt.helper';
import { EReceiptStatus } from '../receipt/receipt.constants';

@Injectable()
export class ReceiptHubConnectService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private s3Service: S3Service,
  ) {}

  async getImageDataForCapium(photo: string) {
    const photoPath = await this.uploadPhotoToBucket(photo);
    try {
      const { imageName, lines, tables } = await this.textractImage(photoPath);
      const data = await this.extractData(lines);
      await this.deleteImage(imageName);

      return data;
    } catch (err) {
      console.log('Error', err);
      return {
        status: EReceiptStatus.rejected,
      };
    }
  }

  async parseReceipt(photos) {
    const promises = photos.map((photo) => {
      return this.getImageDataForCapium(photo);
    });
    const textractData = await Promise.all(promises);
    return textractData;
  }

  async receiptHubConnect(data: LoginDTO): Promise<IRHconnect> {
    const { email, password } = data;
    const user = await this.authRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new HttpException('USER NOT EXIST', HttpStatus.NOT_FOUND);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('WRONG PASSWORD', HttpStatus.BAD_REQUEST);
    }
    const dataCapimToken = { id: user.id, expiresIn: EXPIRE_CAPIUM_JWT_TIME };
    const secretCapiumToken = await this.configService.get('JWT_SECRET');

    const access_token = await this.jwtService.sign(dataCapimToken, {
      secret: `${secretCapiumToken}${user.publicKey}`,
      expiresIn: EXPIRE_CAPIUM_JWT_TIME,
    });

    return {
      access_token,
    };
  }

  async extractData(textData: string[]) {
    const text = textData.join(' ').toLocaleLowerCase();
    const receiptData = {
      supplier: extractSupplier(textData[0]),
      receipt_date: extractDate(text),
      tax: extractVat(text),
      total: extractTotal(text),
      net: extractNet(text),
      vat_code: null,
      currency: extractCurrency(text),
    };

    if (
      receiptData.total &&
      receiptData.tax &&
      (!receiptData.net || receiptData.net === receiptData.total)
    ) {
      const totalNet = Math.abs(receiptData.total - receiptData.tax);
      totalNet > receiptData.total
        ? (receiptData.net = null)
        : (receiptData.net = totalNet);
    }

    if (
      !(
        receiptData.receipt_date ||
        receiptData.total ||
        receiptData.tax ||
        receiptData.currency ||
        receiptData.net
      )
    ) {
      return {
        ...receiptData,
        status: EReceiptStatus.rejected,
      };
    }

    return {
      ...receiptData,
      status: EReceiptStatus.review,
    };
  }

  async textractImage(photoPath) {
    const { lines, tables } = await this.s3Service.textractFile(photoPath);
    const imageName = photoPath.key.split('/')[2];
    return { imageName, lines, tables };
  }

  async deleteImage(image_name: string) {
    try {
      await this.s3Service.deleteFile(`capium/receipts/${image_name}`);
      return 'Image Delete Success';
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async uploadPhotoToBucket(file) {
    if (!file) {
      throw new HttpException('NO RECEIPT PHOTO', HttpStatus.BAD_REQUEST);
    }
    const folderName = 'capium/receipts';
    const response = await this.s3Service.loadFile(file, folderName);

    return {
      link: response.location,
      key: response.key,
    };
  }
}
