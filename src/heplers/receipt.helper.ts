import { ReceiptEntity } from 'src/receipt/entities/receipt.entity';
import {
  EReceiptStatus,
  RECEIPT_DATE_REGEX,
  RECEIPT_TAX_REGEX,
  RECEIPT_TOTAL_REGEX,
} from '../receipt/receipt.constants';

export const extractDate = (text: string) => {
  try {
    const receiptData: string[] | null = text.match(RECEIPT_DATE_REGEX);

    if (!receiptData) {
      return null;
    }

    const timestamp = Date.parse(receiptData[0]);

    if (isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractNumbers = (text: string, regex) => {
  // Find keyword for search
  const matchKeyword = text.match(regex);

  if (!matchKeyword) {
    return null;
  }
  // Split line after keyword
  const splittedText = text.split(` ${matchKeyword[matchKeyword.length - 1]} `);
  if (!splittedText) {
    return null;
  }
  const firstWord = splittedText[splittedText.length - 1]
    .split(' ')[0] // Get next word after keyword
    .replace(',', '') // Replace all comas to dots
    .replace(/\.(?=.*\.)/g, ''); // Remove all dots except last one
  const secondWord = splittedText[splittedText.length - 1]
    .split(' ')[1] // Get second next word after keyword
    .replace(',', '') // Replace all comas to dots
    .replace(/\.(?=.*\.)/g, ''); // Remove all dots except last one

  // Get numbers from first or second words
  const result: string[] | null =
    firstWord.match(/\d+(\.\d+)?$/g) || secondWord.match(/\d+(\.\d+)?$/g);

  if (!result || isNaN(+result[0])) {
    return null;
  }
  return +result[0];
};

export const extractTotal = (text: string) => {
  try {
    return extractNumbers(text, RECEIPT_TOTAL_REGEX);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractTax = (text: string) => {
  try {
    return extractNumbers(text, RECEIPT_TAX_REGEX);
  } catch (err) {
    console.log(err);
    return null;
  }
};
