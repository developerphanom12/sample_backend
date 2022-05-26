import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DashboardStatisticDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date_start?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date_end?: Date;
}
