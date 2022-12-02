import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

import { UpdatePasswordDTO } from './update-password.dto';

export class BindSocialAccountDTO extends UpdatePasswordDTO {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  country: string;
}
