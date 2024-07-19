import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSupplierAccDTO {
  @ApiProperty()
  @IsString()
  name: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  purchase_invoice: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account: string;
}
