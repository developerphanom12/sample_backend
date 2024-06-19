import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { CompanyEntity } from 'src/company/entities/company.entity';
import { FindOperator, FindOptionsWhere } from 'typeorm';
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
  mark_unpaid: 'Mark as unpaid',
  mark_approved : 'Mark as Approved',
  mark_rejected :"Mark as Rejected",
  mark_published:"Mark as Published",
  mark_unpublished : "Mark as Unpublished",
  withdrawl_approval : "Mark as Review",
  withdrawl_rejection :"Mark as Rejection"
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
  mark_unpaid:'mark-unpaid',
  mark_approved :"mark-approved",
  mark_rejected :"mark-rejected",
  mark_published:"mark-published",
  mark_unpublished: "mark-unpublished",
  withdrawl_approval:"withdrawl-approval",
  withdrawl_rejection:"withdrawl-rejection"
};

export const RECEIPT_PHOTOS_LIMIT = 50;
export const RECEIPT_TOTAL_WORDS_REGEX =
  /prev bal|balance due|t o t a l|total|total sale|total amount|paid|total\samount|total\samount\s:|total sale|total to pay|payment|deficit|sale amount|amount|amt|amt.due/g;

export const RECEIPT_DATE_REGEX =
  /\d{2}(?:\d{2})?([.\-\/])\d{1,2}([.\-\/])\d{2}(?:\d{2})?(?=[\/]|,\s|.\s|\s|$)/g;
export const RECEIPT_TOTAL_REGEX =
  /(\d+\.\d+\s?)?(prev bal|balance due|t o t a l|total|total sale|total amount|paid|total\samount|total\samount\s:|total sale|total to pay|payment|deficit|sale amount|amount|amt|amt.due)(\s?[\s|:|.](\s)?(\w{1,3})?\s?\p{Sc}?\s?\d+\.\d+)/gu;
export const RECEIPT_TAX_REGEX =
  /(tax|total tax|tax sum)([\s|:|.]\s?\p{Sc}?\d+\.\d+)/gu;
export const RECEIPT_VAT_REGEX =
  /(\p{Sc}?\d+\.\d+\s?)?(vat \d+%|vat amount|vat ttl|vat rate tax|vat rate|vat included|vat|tax|total tax|tax sum)((\s?[\s|:|.]\s?\p{Sc}?\d+\.\d+%?){1,3})?(totals?\s((\d+\.\d+.?\s){2,3})?)?/gu;
export const RECEIPT_NET_REGEX = /(net ttl|net)([\s|:|.]\s?\p{Sc}?\d+\.\d+)/gu;

export const CURRENCY_SYMBOL_REGEX = /\p{Sc}/gu;

export enum EReceiptStatus {
  processing = 'processing',
  review = 'review',
  rejected = 'rejected',
  accepted = 'accepted',
}

export interface IFilters {
  company: FindOptionsWhere<CompanyEntity>;
  created: FindOperator<Date>;
  status: FindOperator<string>;
  category?: FindOptionsWhere<CategoryEntity> | null;
  supplier_account?: FindOptionsWhere<SupplierEntity> | null;
  payment_type?: FindOptionsWhere<PaymentTypeEntity> | null;
}
