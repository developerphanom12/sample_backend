import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { EReceiptStatus } from '../receipt.constants';

export class PaginationDTO {
  @ApiProperty({required: false})
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  take?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  status?: EReceiptStatus;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  date_start?: Date;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  date_end?: Date;
}
