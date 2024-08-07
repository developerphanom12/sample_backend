











import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { CompanyEntity } from 'src/company/entities/company.entity';
import { FindOperator, FindOptionsWhere } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';



export const EXPENSE_SWAGGER = {
  success: 'Success',
  create: 'Create expense',
  update: 'Update expense',
  get_image: 'Get expense photo',
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
  withdrawl_rejection :"Mark as Rejection",
  get_by_id: 'Get an expense report by ID',

};

export const EXPENSE_ROUTES = {
  main: 'expense-report',
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
  withdrawl_rejection:"withdrawl-rejection",
  get_by_id: 'get-by-id/:id',

};


export interface IFilters {
  company: FindOptionsWhere<CompanyEntity>;
  created: FindOperator<Date>;
  status: FindOperator<string>;
}

export enum ExpenseStatus {
    purchase = 'purchase',
  }
  export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  export class ExpenseNotFoundException extends HttpException {
    constructor(expenseId: string) {
      super(`Expense with ID ${expenseId} not found`, HttpStatus.NOT_FOUND);
    }
  }
