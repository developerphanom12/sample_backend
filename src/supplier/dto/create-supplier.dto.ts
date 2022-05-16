import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSupplierDTO {
  @ApiProperty()
  @IsString()
  name: string;
}
