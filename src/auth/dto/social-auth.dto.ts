import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EOAuthTypes } from '../auth.constants';

export class SocialLoginDTO {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  socialAccountId: string;
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fullName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: EOAuthTypes;
}
