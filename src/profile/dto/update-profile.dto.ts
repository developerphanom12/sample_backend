import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  date_format: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  active_account: string;
}
