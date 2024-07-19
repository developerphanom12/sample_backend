import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @ApiProperty()
  @IsString()
  name: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  sale_invoices: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account: string;
}
