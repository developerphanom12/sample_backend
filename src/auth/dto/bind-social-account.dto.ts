import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

import { UpdatePasswordDTO } from './update-password.dto';

export class BindSocialAccountDTO extends UpdatePasswordDTO {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  country: string;
}
