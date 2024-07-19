import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CustomerAccDto {
  @ApiProperty()
  @IsString()
  name: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  purchase: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_account: string;
}
