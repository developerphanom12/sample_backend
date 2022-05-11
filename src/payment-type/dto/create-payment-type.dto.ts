import { IsString } from 'class-validator';

export class CreatePaymentTypeDTO {
  @IsString()
  name: string;
}
