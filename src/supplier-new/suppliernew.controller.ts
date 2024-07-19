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
  import { PaginationDTO } from './dto/pagination.dto';
import { SUPPLIERACC_ROUTES, SUPPLIERACC_SWAGGER } from './suppliernew.constants';
import { SupplierAccEntity } from './entities/suppliernew.entity';
import { CreateSupplierAccDTO } from './dto/create-suppliernew.dto';
import { UpdateSupplierAccDTO } from './dto/update-suppliernew.dto';
import { SupplierAccService } from './suppliernew.service';
  
  @ApiTags(SUPPLIERACC_ROUTES.main)
  @Controller(SUPPLIERACC_ROUTES.main)
  export class SupplierAccController {
    constructor(private readonly SupplierService: SupplierAccService) {}
  
    @Post(SUPPLIERACC_ROUTES.create)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.create })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
      type: SupplierAccEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async createSupplier(
      @User('id') id: string,
      @Body() body: CreateSupplierAccDTO,
    ) {
      return await this.SupplierService.createSupplier(id, body);
    }
  
    @Put(SUPPLIERACC_ROUTES.update)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.update })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
      type: SupplierAccEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async updateSupplier(
      @User('id') id: string,
      @Body() body: UpdateSupplierAccDTO,
    ) {
      return await this.SupplierService.updateSupplier(id, body);
    }
  
    @Get(SUPPLIERACC_ROUTES.get)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.get })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
      type: SupplierAccEntity,
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
  
    @Get(SUPPLIERACC_ROUTES.get_all)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.get_all })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
      type: SupplierAccEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async getAllSuppliers(
      @User('id') id: string,
      @Query('active_account') active_account: string,
    ) {
      return await this.SupplierService.getAllSuppliers(id, active_account);
    }
  
    @Get(SUPPLIERACC_ROUTES.get_many)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.get_many })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
      type: SupplierAccEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async getSuppliers(
      @User('id') id: string,
      @Query() body: PaginationDTO,
    ) {
      return await this.SupplierService.getSuppliers(id, body);
    }
  
    @Delete(SUPPLIERACC_ROUTES.delete)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: SUPPLIERACC_SWAGGER.delete })
    @ApiResponse({
      status: HttpStatus.OK,
      description: SUPPLIERACC_SWAGGER.success,
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
  