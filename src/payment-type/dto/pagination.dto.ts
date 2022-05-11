import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  take?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  skip?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
