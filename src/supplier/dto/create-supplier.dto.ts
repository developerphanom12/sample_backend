import { IsString } from 'class-validator';

export class CreateSupplierDTO {
  @IsString()
  name: string;
}
