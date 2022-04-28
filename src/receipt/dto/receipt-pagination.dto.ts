import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Transform(({value}) => Number.parseInt(value))
  take?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({value}) => Number.parseInt(value))
  skip?: number;
}
