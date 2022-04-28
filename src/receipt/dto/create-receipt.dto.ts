import { IsOptional, IsString } from 'class-validator';

export class CreateReceiptDTO {
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  currency?: string;
}
