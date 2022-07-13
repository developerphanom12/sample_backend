import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCompanyDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isDeleteLogo?: boolean;
}
