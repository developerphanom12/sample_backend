import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { CreateSupplierDTO } from './dto/create-supplier.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateSupplierDTO } from './dto/update-supplier.dto';
import { SUPPLIER_ROUTES } from './supplier.constants';
import { SupplierService } from './supplier.service';

@ApiTags(SUPPLIER_ROUTES.main)
@Controller(SUPPLIER_ROUTES.main)
export class SupplierController {
  constructor(private readonly SupplierService: SupplierService) {}

  @Post(SUPPLIER_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  public async createSupplier(
    @User('id') id: string,
    @Body() body: CreateSupplierDTO,
  ) {
    return await this.SupplierService.createSupplier(id, body);
  }

  @Put(SUPPLIER_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdateSupplierDTO,
  ) {
    return await this.SupplierService.updateSupplier(id, body);
  }

  @Get(SUPPLIER_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  public async getSupplier(
    @User('id') id: string,
    @Param('supplierId') supplierId: string,
  ) {
    return await this.SupplierService.getSupplierDetails(id, supplierId);
  }

  @Get(SUPPLIER_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  public async getAllSuppliers(@User('id') id: string) {
    return await this.SupplierService.getAllSuppliers(id);
  }

  @Get(SUPPLIER_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.SupplierService.getSuppliers(id, body);
  }

  @Delete(SUPPLIER_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceipt(@User('id') id: string, @Param('supplierId') supplierId) {
    return await this.SupplierService.deleteSupplier(id, supplierId);
  }
}
