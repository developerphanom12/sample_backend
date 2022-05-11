import { IsOptional, IsString } from 'class-validator';
import { EReceiptStatus } from '../receipt.constants';

export class UpdateReceiptDTO {
  id: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  status?: EReceiptStatus;

  @IsOptional()
  receipt_date: Date;

  @IsOptional()
  @IsString()
  supplier: string;

  @IsOptional()
  @IsString()
  supplier_account: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  vat_code: string;

  @IsOptional()
  net: number;

  @IsOptional()
  tax: number;

  @IsOptional()
  total: number;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  publish_status: boolean;
  
  @IsOptional()
  payment_status: boolean;
}
