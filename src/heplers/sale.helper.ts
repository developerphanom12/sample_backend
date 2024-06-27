import { ExpenseField } from '@aws-sdk/client-textract';
import { CurrencySeed } from '../constants/seed';

import { parse } from 'date-fns';
import { CURRENCY_SYMBOL_REGEX, RECEIPT_DATE_REGEX, RECEIPT_NET_REGEX, RECEIPT_TAX_REGEX, RECEIPT_TOTAL_REGEX, RECEIPT_TOTAL_WORDS_REGEX, RECEIPT_VAT_REGEX } from 'src/sales/sales.constants';

export const extractDate = (text: string) => {
  try {
    const regex1 = /\d{4}-\d{2}-\d{2}/;
    const regex2 = /\d{2}\/\d{2}\/\d{4}/;
    const regex3 = /\d{2}\/\d{2}\/\d{4}/;
    const regex4 = /\d{4}\/\d{2}\/\d{2}/;
    const regex5 = /[A-Z][a-z]+ \d{1,2}, \d{4}/;
    const regex6 = /\d{1,2} [A-Z][a-z]+ \d{4}/;
    const regex7 = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
    const regex8 = /\d{2}\.\d{2}\.\d{4}/;
    const regex9 = /\d{4}\.\d{2}\.\d{2}/;
    const regex10 = /\d{4}\/\d{2}\/\d{2}/;
    const regex11 = /[A-Za-z]{3} \d{2} [A-Za-z]{3} \d{4}/;
    const regex12 = /\d{1,2} [A-Za-z]{3} \d{4}/;
    const regex13 = /\d{1,2} [A-Za-z]{3} \d{2}/;
    const regex14 = /([A-Za-z]+)(\d{1,2})'(\d{2})/;
    const regex15 = /(\d{1,2})([A-Za-z]+)'(\d{2})/;

    const receiptData: string[] | null =
      text.match(RECEIPT_DATE_REGEX) ||
      text.match(regex1) ||
      text.match(regex2) ||
      text.match(regex3) ||
      text.match(regex4) ||
      text.match(regex5) ||
      text.match(regex6) ||
      text.match(regex7) ||
      text.match(regex8) ||
      text.match(regex9) ||
      text.match(regex10) ||
      text.match(regex11) ||
      text.match(regex12) ||
      text.match(regex13) ||
      text.match(regex14) ||
      text.match(regex15);

    if (!receiptData) {
      return null;
    }

    const parseDateString = (dateString: string) => {
      // Define an array of regular expressions for common date formats
      const dateFormats = [
        { reg: /\d{4}-\d{2}-\d{2}/, type: 'yyyy-MM-dd' },
        { reg: /\d{2}\.\d{2}\.\d{4}/, type: 'dd.MM.yyyy' },
        { reg: /\d{2}\/\d{2}\/\d{4}/, type: 'dd/MM/yyyy' },
        { reg: /\d{2}\.\d{2}\.\d{4}/, type: 'MM.dd.yyyy' },
        { reg: /\d{2}\/\d{2}\/\d{4}/, type: 'MM/dd/yyyy' },
        { reg: /\d{4}\.\d{2}\.\d{2}/, type: 'yyyy.MM.dd' },
        { reg: /\d{2}-\d{2}-\d{4}/, type: 'MM-dd-yyyy' },
        { reg: /\d{2}-\d{2}-\d{4}/, type: 'dd-MM-yyyy' },
        { reg: /\d{2}\/\d{2}\/\d{2}/, type: 'MM/dd/yy' },
        { reg: /\d{2}\/\d{2}\/\d{2}/, type: 'dd/MM/yy' },
      ];
      const matched = [];

      for (const format of dateFormats) {
        const match = dateString.match(format.reg);

        if (match) {
          matched.push({ date: match[0], type: format.type });
        }
      }

      const parseValidDate = (dateObjects) => {
        for (const dateObject of dateObjects) {
          const dateString = dateObject.date;
          const dateFormat = dateObject.type;

          try {
            const parsedDate = parse(dateString, dateFormat, new Date());
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          } catch (error) {
            // Invalid date format, continue to the next format
            continue;
          }
        }

        // If none of the formats are valid, return null or handle as needed
        return null;
      };

      return parseValidDate(matched) || new Date(NaN);
    };

    const timeString = receiptData[0]
      .replace(/\./g, '/')
      .split('/')
      .reverse()
      .join('/');

    const timestamp =
      Date.parse(timeString) || parseDateString(receiptData[0]).getTime();

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
    if (text?.length < 3) {
      return null;
    }
    const result = text?.match(/\w+\s?\w+/g);
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
