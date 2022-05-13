import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');

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
  create: 'Create Receipt',
  success: 'Success',
};

export const RECEIPT_ROUTES = {
  main: 'receipt',
  create: 'create',
  update: 'update',
  get_all: 'get-all',
  delete: 'delete/:id',
  get_image: 'images/:imagename',
  delete_image: 'delete-image/:imagename',
};

export const RECEIPT_PHOTOS_LIMIT = 10;

export const RECEIPT_DATE_REGEX =
  /\d{2}(?:\d{2})?([.\-/])\d{1,2}([.\-/])\d{2}(?:\d{2})?(?=[/]|,\s|.\s|\s|$)/g;
export const RECEIPT_TOTAL_REGEX =
  /(total\samount\s:)|(total\samount)|(total\s:)|total(?=\s|$)/g;
export const RECEIPT_TAX_REGEX = /tax(?=\s|$)/g;

export enum EReceiptStatus {
  processing = 'processing',
  review = 'review',
  rejected = 'rejected',
  accepted = 'accepted',
}
