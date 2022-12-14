import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { EReceiptStatus } from '../receipt.constants';

export class PaginationDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: EReceiptStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date_start?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date_end?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier_account?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_type?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isMobile?: boolean | string = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account?: string;
}
