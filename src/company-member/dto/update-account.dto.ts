import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ECompanyRoles } from '../company-member.constants';

export class UpdateCompanyAccountDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ default: false })
  @IsOptional()
  isInviteCompanyMember: boolean;

  @ApiProperty()
  @IsNotEmpty()
  role: ECompanyRoles;
}
