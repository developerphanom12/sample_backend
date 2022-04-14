import { ApiProperty } from '@nestjs/swagger';
import { Length, IsOptional } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsOptional()
  password: string;
  @ApiProperty()
  @Length(8, 30)
  newPassword: string;
}