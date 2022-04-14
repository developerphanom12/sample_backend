import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdatePasswordDTO {
  @ApiProperty()
  token: string;
  @ApiProperty()
  @Length(8, 30)
  newPassword: string;
}
