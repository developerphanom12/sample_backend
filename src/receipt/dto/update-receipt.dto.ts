import { IsOptional, IsString } from 'class-validator';
import { EReceiptStatus } from '../receipt.constants';

export class UpdateReceiptDTO {
  id: string;
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  status?: EReceiptStatus;

  @IsOptional()
  receipt_date?: Date | null;

  @IsOptional()
  @IsString()
  supplier?: string | null;

  @IsOptional()
  @IsString()
  supplier_account?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  vat_code?: string | null;

  @IsOptional()
  net?: number | null;

  @IsOptional()
  tax?: number | null;

  @IsOptional()
  total?: number | null;

  @IsOptional()
  @IsString()
  type?: string | null;

  @IsOptional()
  currency?: string | null;

  @IsOptional()
  publish_status?: boolean;

  @IsOptional()
  payment_status?: boolean;
}
