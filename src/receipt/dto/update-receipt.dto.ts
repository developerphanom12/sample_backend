import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EReceiptStatus } from '../receipt.constants';

export class UpdateReceiptDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  status?: EReceiptStatus;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  receipt_date?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  supplier?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  supplier_account?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  category?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  vat_code?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  net?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  tax?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  total?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  type?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  currency?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  publish_status?: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  payment_status?: boolean;
}
