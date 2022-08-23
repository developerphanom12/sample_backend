import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { EMAIL_VALIDATION, PASSWORD_VALIDATION } from '../auth.constants';

export class RegistrationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(EMAIL_VALIDATION)
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(PASSWORD_VALIDATION)
  @Length(8, 30)
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  token: string;
}
