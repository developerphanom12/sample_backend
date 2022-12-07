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
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { COMPANY_ROUTES, COMPANY_SWAGGER } from './company.constants';
import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateCompanyDTO } from './dto/update-company.dto';
import { CompanyEntity } from './entities/company.entity';

@ApiTags(COMPANY_ROUTES.main)
@Controller(COMPANY_ROUTES.main)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post(COMPANY_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: COMPANY_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: CompanyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createCompany(
    @User('id') id: string,
    @Body() body: CreateCompanyDTO,
    @UploadedFile() file,
  ) {
    return await this.companyService.createCompany(id, body, file);
  }

  @Get(COMPANY_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: CompanyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCompany(
    @User('id') id: string,
    @Param('company') company: string,
  ) {
    return await this.companyService.getCompany(id, company);
  }

  @Get(COMPANY_ROUTES.get_logo)
  @ApiOperation({ summary: COMPANY_SWAGGER.get_logo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getCompanyLogo(@Param('company') company: string, @Res() res) {
    return await this.companyService.getCompanyLogo(company, res);
  }

  @Post(COMPANY_ROUTES.change_logo)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: COMPANY_SWAGGER.change_logo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async changeCompanyLogo(
    @User('id') id: string,
    @UploadedFile() file,
    @Body() body: { active_account?: string },
  ) {
    return await this.companyService.changeCompanyLogo(
      id,
      file,
      body?.active_account,
    );
  }

  @Put(COMPANY_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: COMPANY_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async updateCompany(
    @User('id') id: string,
    @Param('company') company: string,
    @Body() body: UpdateCompanyDTO,
    @UploadedFile() file,
  ) {
    return await this.companyService.updateCompany(company, body, file);
  }

  @Delete(COMPANY_ROUTES.delete_logo)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.delete_logo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteLogo(@User('id') id: string, @Param('company') companyId) {
    return await this.companyService.deleteCompanyLogo(companyId);
  }

  @Get(COMPANY_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: CompanyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllCompanies(@User('id') id: string) {
    return await this.companyService.getAllCompanies(id);
  }

  @Get(COMPANY_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: CompanyEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.companyService.getManyCompanies(id, body);
  }

  @Delete(COMPANY_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceipt(@User('id') id: string, @Param('id') companyId) {
    return await this.companyService.companyDelete(id, companyId);
  }

  @Get(COMPANY_ROUTES.get_members)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.get_members })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: MemberEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCompanyMembers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.companyService.getCompanyMembers(id, body);
  }

  @Get(COMPANY_ROUTES.get_invitation)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: COMPANY_SWAGGER.get_invitation })
  @ApiResponse({
    status: HttpStatus.OK,
    description: COMPANY_SWAGGER.success,
    type: MemberEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCompanyInvitations(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.companyService.getAllCompanyInvitations(id, body);
  }
}
