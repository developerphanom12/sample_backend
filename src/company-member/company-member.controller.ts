import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import {
  COMPANY_MEMBER_ROUTES,
  COMPANY_MEMBER_SWAGGER,
} from './company-member.constants';
import { CompanyMemberService } from './company-member.service';
import { CreateCompanyAccountDTO } from './dto/create-account.dto';
import { UpdateCompanyAccountDTO } from './dto/update-account.dto';
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
  ) {
    return await this.companyMemberService.deleteCompanyMember(id, accountId);
  }
}
