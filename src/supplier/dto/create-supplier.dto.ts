import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSupplierDTO {
  @ApiProperty()
  @IsString()
  name: string;


  @ApiProperty()
  @IsString()
  code: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account: string;
}
