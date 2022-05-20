import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendReceiptEmailDTO {
  @ApiProperty()
  @IsNotEmpty()
  receipts: string[];
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  to: string;
  @ApiProperty()
  @IsNotEmpty()
  subject: string;
  @ApiProperty({ required: false })
  message?: string;
}
