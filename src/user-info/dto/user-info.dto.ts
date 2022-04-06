import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserInfoDTO {
  @ApiProperty()
  @IsNotEmpty()
  currency: string;
  @ApiProperty()
  @IsNotEmpty()
  date_format: string;
}
