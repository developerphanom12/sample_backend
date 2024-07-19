import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSupplierAccDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;
  
  @ApiProperty()
  @IsString()
  purchase_invoice: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  active_account: string;
}
