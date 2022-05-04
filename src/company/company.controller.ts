import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('create')
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: 'Create company' })
  public async createCompany(
    @User('id') id: string,
    @Body() body: CreateCompanyDTO,
  ) {
    return await this.companyService.createCompany(id, body);
  }
  @Get('get/:company')
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: 'Get one company' })
  public async getCompany(
    @User('id') id: string,
    @Param('company') company: string,
  ) {
    return await this.companyService.getCompany(id, company);
  }
  @Get('get-all')
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: 'Get all companies' })
  public async getAllCompanies(@User('id') id: string) {
    return await this.companyService.getAllCompanies(id);
  }
}
