import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SalesDownloadCSVDTO {
  @ApiProperty()
  receipts: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  active_account: string;
}
