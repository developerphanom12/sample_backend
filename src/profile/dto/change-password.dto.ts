import { ApiProperty } from '@nestjs/swagger';
import { Length, IsOptional } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty()
  @IsOptional()
  old_password: string;
  @ApiProperty()
  @Length(8, 30)
  new_password: string;
}