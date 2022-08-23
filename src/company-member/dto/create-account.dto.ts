import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ECompanyRoles } from '../company-member.constants';

export class CreateCompanyAccountDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  role: ECompanyRoles;
  @ApiProperty()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsOptional()
  companiesIds: string[];
}
