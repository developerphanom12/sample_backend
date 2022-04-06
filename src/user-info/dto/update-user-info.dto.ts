import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserInfoDTO {
  @ApiProperty()
  @IsOptional()
  currency: string;
  @ApiProperty()
  @IsOptional()
  date_format: string;
}
