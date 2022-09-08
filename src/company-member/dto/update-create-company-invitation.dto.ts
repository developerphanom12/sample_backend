import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { ECompanyRoles } from '../company-member.constants';

export class UpdateCreateCompanyInvitationDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  role: ECompanyRoles;

  @ApiProperty({ required: false })
  @IsOptional()
  isResendEmail: false;
}
