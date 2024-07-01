import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class PaginationDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;




  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isMobile?: boolean | string = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account?: string;
}
