import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Workbook, Worksheet } from 'exceljs';
import * as tmp from 'tmp';

@Injectable()
export class DownloadService {
  constructor(private configService: ConfigService) {}

  private styleSheet(sheet: Worksheet) {
    sheet.getRow(1).height = 20;
    sheet.getRow(1).font = {
      size: 12,
      bold: true,
      color: { argb: '000000' },
    };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: 'ea9fa7' },
      fgColor: { argb: 'ea9fa7' },
    };
    sheet.getRow(1).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    };

    for (let i = 1; i < 14; i++) {
      sheet.getColumn(i).width = 16;
      sheet.getColumn(i).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    }
  }

  public async createCSV(data, fields) {
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
    this.styleSheet(sheet);

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
