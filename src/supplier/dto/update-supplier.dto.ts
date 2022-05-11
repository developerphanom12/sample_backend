import { IsString } from 'class-validator';

export class UpdateSupplierDTO {
  @IsString()
  id: string;
  @IsString()
  name: string;
}
