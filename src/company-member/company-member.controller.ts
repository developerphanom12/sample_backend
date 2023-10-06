import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { MemberInvitesEntity } from '../invite-new-member/entities/company-member-invites.entity';
import { PROFILE_ROUTES, PROFILE_SWAGGER } from '../profile/profile.constants';
import {
  COMPANY_MEMBER_ROUTES,
  COMPANY_MEMBER_SWAGGER,
} from './company-member.constants';
import { CompanyMemberService } from './company-member.service';
import { CreateCompanyAccountDTO } from './dto/create-account.dto';
import { UpdateCompanyAccountDTO } from './dto/update-account.dto';
import { UpdateCreateCompanyInvitationDTO } from './dto/update-create-company-invitation.dto';
import { MemberEntity } from './entities/company-member.entity';

@Controller(COMPANY_MEMBER_ROUTES.main)
export class CompanyMemberController {
  constructor(private readonly companyMemberService: CompanyMemberService) {}

  @Post(COMPANY_MEMBER_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: MemberEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createCompanyAcc(
    @User('id') id: string,
    @Body() body: CreateCompanyAccountDTO,
  ) {
    return await this.companyMemberService.createCompanyMember(id, body);
  }

  @Put(COMPANY_MEMBER_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: MemberEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateCompanyAcc(
    @User('id') id: string,
    @Param('accountId') accountId: string,
    @Body() body: UpdateCompanyAccountDTO,
  ) {
    return await this.companyMemberService.updateCompanyMember(
      id,
      accountId,
      body,
    );
  }

  @Put(COMPANY_MEMBER_ROUTES.update_create_company_invite)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({
    summary: COMPANY_MEMBER_SWAGGER.update_create_company_invite,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: MemberInvitesEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateCompanyCreateInvite(
    @User('id') id: string,
    @Param('inviteId') inviteId: string,
    @Body() body: UpdateCreateCompanyInvitationDTO,
  ) {
    return await this.companyMemberService.updateCompanyCreateInvite(
      id,
      inviteId,
      body,
    );
  }

  @Get(COMPANY_MEMBER_ROUTES.get_accounts)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.get_accounts })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: MemberEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getUserAccounts(@User('id') id: string) {
    return await this.companyMemberService.getUserAccounts(id);
  }

  @Put(COMPANY_MEMBER_ROUTES.select_active_account)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.select_active_account })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: AuthEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async selectActiveAccount(
    @User('id') id: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.companyMemberService.selectActiveAccount(id, accountId);
  }

  @Post(COMPANY_MEMBER_ROUTES.resend_invitation)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.resend_invitation })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
    type: AuthEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async resendInvitation(
    @User('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    return await this.companyMemberService.resendInvitation(id, invitationId);
  }

  @Delete(COMPANY_MEMBER_ROUTES.delete_create_company_invite)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({
    summary: COMPANY_MEMBER_SWAGGER.delete_create_company_invite,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteCompanyCreateInvitation(
    @Param('invitationId') invitationId: string,
  ) {
    return await this.companyMemberService.deleteCompanyCreateinvitation(
      invitationId,
    );
  }

  @Delete(COMPANY_MEMBER_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_MEMBER_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_MEMBER_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteCompanyAcc(
    @User('id') id: string,
    @Param('accountId') accountId: string,
    @Query() body: { active_account?: string },
  ) {
    return await this.companyMemberService.deleteCompanyMember(
      id,
      accountId,
      body?.active_account,
    );
  }

  @Get(PROFILE_ROUTES.get_photo)
  @ApiOperation({ summary: PROFILE_SWAGGER.get_photo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getAvatar(@Param('id') id: string) {
    return await this.companyMemberService.getProfileImage(id);
  }
}
