import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';

@Injectable()
export class DownloadService {
  constructor(private configService: ConfigService) {}

  public async downloadCSV(data, fields) {
    const rows = [];

    data.forEach((el) => {
      rows.push(Object.values(el));
    });

    const book = new Workbook();
    const sheet = book.addWorksheet('receipts');

    rows.unshift(fields);
    sheet.addRows(rows);

    const File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescription: true,
          prefix: 'ReceiptHub',
          postfix: '.csv',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            console.error(err);
            throw err;
          }
          book.csv
            .writeFile(file, { formatterOptions: { delimiter: ';' } })
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw err;
            });
        },
      );
    });

    return File;
  }

  public async createXLSX(data, fields) {
    const rows = [];

    data.forEach((el) => {
      rows.push(Object.values(el));
    });

    const book = new Workbook();
    const sheet = book.addWorksheet('receipts');

    rows.unshift(fields);
    sheet.addRows(rows);

    const File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescription: true,
          prefix: 'ReceiptHub',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            console.error(err);
            throw err;
          }
          book.xlsx
            .writeFile(file)
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw err;
            });
        },
      );
    });

    return File;
  }
}
