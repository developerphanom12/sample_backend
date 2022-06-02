import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { CompanyEntity } from 'src/company/entities/company.entity';
import { FindOperator } from 'typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { SupplierEntity } from 'src/supplier/entities/supplier.entity';
import { PaymentTypeEntity } from 'src/payment-type/entities/payment-type.entity';

export const receiptPhotoPath = 'uploads/receipts/';

export const receiptPhotoStorage = {
  storage: diskStorage({
    destination: `./${receiptPhotoPath}`,
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

export const RECEIPT_SWAGGER = {
  success: 'Success',
  create: 'Create receipt',
  update: 'Update receipt',
  get_image: 'Get receipt photo',
  get_all: 'Get all receipts',
  get_many: 'Get receipts with pagination',
  download_csv: 'Download CSV File',
  download_xlsx: 'Download XLSX File',
  send_email: 'Send Email with Receipts',
  delete: 'Delete receipt',
  mark_paid: 'Mark as paid',
  delete_image: 'Delete receipt image',
};

export const RECEIPT_ROUTES = {
  main: 'receipt',
  create: 'create',
  update: 'update',
  get_all: 'get-all',
  download_csv: 'download-csv',
  download_xlsx: 'download-xlsx',
  send_email: 'send-email',
  delete: 'delete',
  mark_paid: 'mark-paid',
  get_image: 'images/:imagename',
  delete_image: 'delete-image/:imagename',
};

export const RECEIPT_PHOTOS_LIMIT = 10;

export const RECEIPT_DATE_REGEX =
  /\d{2}(?:\d{2})?([.\-\/])\d{1,2}([.\-\/])\d{2}(?:\d{2})?(?=[\/]|,\s|.\s|\s|$)/g;
export const RECEIPT_TOTAL_REGEX =
  /(total\samount\s:)|(total\samount)|(total\s:)|total(?=\s|$)/g;
export const RECEIPT_TAX_REGEX = /tax(?=\s|$)/g;

export enum EReceiptStatus {
  processing = 'processing',
  review = 'review',
  rejected = 'rejected',
  accepted = 'accepted',
}

export interface IFilters {
  company: CompanyEntity;
  created: FindOperator<Date>;
  status: FindOperator<string>;
  category?: CategoryEntity | null;
  supplier?: SupplierEntity | null;
  payment_type?: PaymentTypeEntity | null;
}
