import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { EMAIL_VALIDATION } from '../auth.constants';

export class RegistrationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(EMAIL_VALIDATION)
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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
}
