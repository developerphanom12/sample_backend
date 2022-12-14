import { ExpenseField } from '@aws-sdk/client-textract';
import { CurrencySeed } from '../constants/seed';
import {
  CURRENCY_SYMBOL_REGEX,
  RECEIPT_DATE_REGEX,
  RECEIPT_NET_REGEX,
  RECEIPT_TAX_REGEX,
  RECEIPT_TOTAL_REGEX,
  RECEIPT_TOTAL_WORDS_REGEX,
  RECEIPT_VAT_REGEX,
} from '../receipt/receipt.constants';

export const extractDate = (text: string) => {
  try {
    const receiptData: string[] | null = text.match(RECEIPT_DATE_REGEX);
    if (!receiptData) {
      return null;
    }
    const timeString = receiptData[0]
      .replace(/\./g, '/')
      .split('/')
      .reverse()
      .join('/');
    const timestamp = Date.parse(timeString);

    if (isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractNumbers = (text: string, regex: RegExp) => {
  // Find keyword for search
  const matchKeyword = text.match(regex);

  if (!matchKeyword) {
    return null;
  }

  if (
    matchKeyword.filter((el) => el.match(RECEIPT_TOTAL_WORDS_REGEX)).length > 1
  ) {
    const results = matchKeyword.flatMap((item) => item.match(/\d+.\d+/g));
    const result = Math.max(...results.map((el) => +el));

    if (!result || isNaN(result)) {
      return null;
    }
    return result;
  }

  const results = matchKeyword[matchKeyword.length - 1].match(/\d+.\d+/g);

  if (results?.length === 1) {
    if (isNaN(+results[0])) {
      return null;
    }
    return +results[0];
  }
  if (results?.length > 1) {
    const result = Math.max(...results.map((el) => +el));
    if (!results[0] || isNaN(+results[0])) {
      return null;
    }

    return result;
  }
};

export const extractVatNumbers = (text: string, regex: RegExp) => {
  let matchKeyword = text.match(regex);

  if (!matchKeyword) {
    return null;
  }

  const filteredStrings = matchKeyword?.filter((item) =>
    item.match(/\d+.\d+/g),
  );
  if (!filteredStrings.length) {
    return null;
  }
  const results = filteredStrings[filteredStrings.length - 1].match(/\d+.\d+/g);

  if (!results) {
    return null;
  }

  if (results?.length > 1) {
    const minResult = Math.min(...results.map((el) => +el));
    if (!minResult || isNaN(+minResult)) {
      return null;
    }
    return minResult;
  }

  if (!results[0] || isNaN(+results[0])) {
    return null;
  }
  return +results[0];
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

export const extractVat = (text: string) => {
  try {
    return extractVatNumbers(text, RECEIPT_VAT_REGEX);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractCurrency = (text: string) => {
  try {
    let matchKeyword = text.match(CURRENCY_SYMBOL_REGEX);

    if (!matchKeyword) {
      return null;
    }

    const currency = CurrencySeed.find(
      (item) => item.symbol === matchKeyword[0],
    );

    if (!currency) {
      return null;
    }
    return currency.country;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractNet = (text: string) => {
  try {
    return extractNumbers(text, RECEIPT_NET_REGEX);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const extractSupplier = (text: string) => {
  try {
    if (text.length < 3) {
      return null;
    }
    const result = text.match(/\w+\s?\w+/g);
    if (!result) {
      return text;
    } else {
      return result[0];
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};
