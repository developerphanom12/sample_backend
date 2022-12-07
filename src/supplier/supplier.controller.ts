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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { CreateSupplierDTO } from './dto/create-supplier.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateSupplierDTO } from './dto/update-supplier.dto';
import { SupplierEntity } from './entities/supplier.entity';
import { SUPPLIER_ROUTES, SUPPLIER_SWAGGER } from './supplier.constants';
import { SupplierService } from './supplier.service';

@ApiTags(SUPPLIER_ROUTES.main)
@Controller(SUPPLIER_ROUTES.main)
export class SupplierController {
  constructor(private readonly SupplierService: SupplierService) {}

  @Post(SUPPLIER_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
    type: SupplierEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createSupplier(
    @User('id') id: string,
    @Body() body: CreateSupplierDTO,
  ) {
    return await this.SupplierService.createSupplier(id, body);
  }

  @Put(SUPPLIER_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
    type: SupplierEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdateSupplierDTO,
  ) {
    return await this.SupplierService.updateSupplier(id, body);
  }

  @Get(SUPPLIER_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
    type: SupplierEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSupplier(
    @User('id') id: string,
    @Param('supplierId') supplierId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.SupplierService.getSupplierDetails(
      id,
      supplierId,
      active_account,
    );
  }

  @Get(SUPPLIER_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
    type: SupplierEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllSuppliers(
    @User('id') id: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.SupplierService.getAllSuppliers(id, active_account);
  }

  @Get(SUPPLIER_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
    type: SupplierEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.SupplierService.getSuppliers(id, body);
  }

  @Delete(SUPPLIER_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SUPPLIER_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUPPLIER_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceipt(
    @User('id') id: string,
    @Param('supplierId') supplierId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.SupplierService.deleteSupplier(
      id,
      supplierId,
      active_account,
    );
  }
}
