import { IsString } from 'class-validator';

export class UpdatePaymentTypeDTO {
  @IsString()
  id: string;
  @IsString()
  name: string;
}
