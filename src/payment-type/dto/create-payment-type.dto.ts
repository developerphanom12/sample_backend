import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentTypeDTO {
  @ApiProperty()
  @IsString()
  name: string;
}
