import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  withAccountant?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  currency: string;

  @ApiProperty()
  @IsNotEmpty()
  date_format: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  active_account: string;
}
