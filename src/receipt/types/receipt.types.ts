import { FindOptionsOrderValue } from 'typeorm';

import { ReceiptEntity } from '../entities/receipt.entity';

export type TSortOrder = FindOptionsOrderValue;
export type TSortField = keyof ReceiptEntity;
