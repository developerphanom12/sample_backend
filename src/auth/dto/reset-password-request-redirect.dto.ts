import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordRequestRedirectDTO {
  @ApiProperty()
  @IsString()
  token: string;
}
