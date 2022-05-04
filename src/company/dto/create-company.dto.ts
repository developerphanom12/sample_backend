import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDTO {
  @ApiProperty()
  @IsOptional()
  name?: string;
  @ApiProperty()
  @IsNotEmpty()
  currency: string;
  @ApiProperty()
  @IsNotEmpty()
  date_format: string;
}
