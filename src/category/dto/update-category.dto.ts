import { IsString } from 'class-validator';

export class UpdateCategoryDTO {
  @IsString()
  id: string;
  @IsString()
  name: string;
}
