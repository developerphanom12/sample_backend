import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EReceiptStatus } from '../sales.constants';

export class UpdateSaleDTO {
  @ApiProperty()
  @IsString()
  id: string;


  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  status?: EReceiptStatus;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  invoice_date?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  due_date?: Date | null;



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

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  active_account?: string;


}
