import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { EMAIL_VALIDATION } from '../auth.constants';

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Matches(EMAIL_VALIDATION)
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  password: string;
}