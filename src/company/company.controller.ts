import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { COMPANY_ROUTES, COMPANY_SWAGGER } from './company.constants';
import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './dto/create-company.dto';

@ApiTags(COMPANY_ROUTES.main)
@Controller(COMPANY_ROUTES.main)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post(COMPANY_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard)
  @ApiOperation({ summary: COMPANY_SWAGGER.create })
  public async createCompany(
    @User('id') id: string,
    @Body() body: CreateCompanyDTO,
  ) {
    return await this.companyService.createCompany(id, body);
  }

  @Get(COMPANY_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard)
  @ApiOperation({ summary: COMPANY_SWAGGER.get })
  public async getCompany(
    @User('id') id: string,
    @Param('company') company: string,
  ) {
    return await this.companyService.getCompany(id, company);
  }

  @Get(COMPANY_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard)
  @ApiOperation({ summary: COMPANY_SWAGGER.get_all })
  public async getAllCompanies(@User('id') id: string) {
    return await this.companyService.getAllCompanies(id);
  }
}
