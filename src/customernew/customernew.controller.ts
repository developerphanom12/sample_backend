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
import { CUSTOMER_ROUTES, CUSTOMER_SWAGGER } from './customernew.constants';
import { CustomerEntity } from './entities/customernew.entity';
import { CustomerDto } from './dto/create-customernew.dto';
import { UpdateCustomerDTO } from './dto/update-customernew.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { CustomerService } from './customernew.service';
  
  @ApiTags(CUSTOMER_ROUTES.main)
  @Controller(CUSTOMER_ROUTES.main)
  export class CustomerAccController {
    constructor(private readonly CustomerAccService: CustomerService) {}
  
    @Post(CUSTOMER_ROUTES.create)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: CUSTOMER_SWAGGER.create })
    @ApiResponse({
      status: HttpStatus.OK,
      description: CUSTOMER_SWAGGER.success,
      type: CustomerEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async createSupplier(
      @User('id') id: string,
      @Body() body: CustomerDto,
    ) {
      return await this.CustomerAccService.createSupplier(id, body);
    }



  @Put(CUSTOMER_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMER_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMER_SWAGGER.success,
    type: CustomerEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdateCustomerDTO,
  ) {
    return await this.CustomerAccService.updateSupplier(id, body);
  }


  @Get(CUSTOMER_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMER_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMER_SWAGGER.success,
    type: CustomerEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSupplier(
    @User('id') id: string,
    @Param('customerId') customerId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CustomerAccService.getSupplierDetails(
      id,
      customerId,
      active_account,
    );
  }

  @Get(CUSTOMER_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMER_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMER_SWAGGER.success,
    type: CustomerEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllSuppliers(
    @User('id') id: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CustomerAccService.getAllSuppliers(id, active_account);
  }


  @Get(CUSTOMER_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMER_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMER_SWAGGER.success,
    type: CustomerEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.CustomerAccService.getSuppliers(id, body);
  }


  @Delete(CUSTOMER_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMER_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,     
    description: CUSTOMER_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)    
  public async deleteReceipt(    
    @User('id') id: string,
    @Param('customerId') customerId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CustomerAccService.deleteSupplier(
      id,
      customerId,
      active_account,
    );
  }
}