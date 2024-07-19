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
import { CUSTOMERACC_ROUTES, CUSTOMERACC_SWAGGER } from './customeracc.constants';
import { CustomerAccEntity } from './entities/customeracc.entity';
import { CustomerAccDto } from './dto/create-customeracc.dto';
import { CustomerAccService } from './customeracc.service';
import { UpdateCustomerAccDTO } from './dto/update-customeracc.dto';
import { PaginationDTO } from './dto/pagination.dto';
  
  @ApiTags(CUSTOMERACC_ROUTES.main)
  @Controller(CUSTOMERACC_ROUTES.main)
  export class CustomerAccController {
    constructor(private readonly CustomerAccService: CustomerAccService) {}
  
    @Post(CUSTOMERACC_ROUTES.create)
    @UseGuards(new JwtAuthenticationGuard())
    @ApiOperation({ summary: CUSTOMERACC_SWAGGER.create })
    @ApiResponse({
      status: HttpStatus.OK,
      description: CUSTOMERACC_SWAGGER.success,
      type: CustomerAccEntity,
    })
    @HttpCode(HttpStatus.OK)
    public async createSupplier(
      @User('id') id: string,
      @Body() body: CustomerAccDto,
    ) {
      return await this.CustomerAccService.createSupplier(id, body);
    }



  @Put(CUSTOMERACC_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMERACC_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMERACC_SWAGGER.success,
    type: CustomerAccEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdateCustomerAccDTO,
  ) {
    return await this.CustomerAccService.updateSupplier(id, body);
  }


  @Get(CUSTOMERACC_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMERACC_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMERACC_SWAGGER.success,
    type: CustomerAccEntity,
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

  @Get(CUSTOMERACC_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMERACC_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMERACC_SWAGGER.success,
    type: CustomerAccEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllSuppliers(
    @User('id') id: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CustomerAccService.getAllSuppliers(id, active_account);
  }


  @Get(CUSTOMERACC_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMERACC_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CUSTOMERACC_SWAGGER.success,
    type: CustomerAccEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.CustomerAccService.getSuppliers(id, body);
  }


  @Delete(CUSTOMERACC_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CUSTOMERACC_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,     
    description: CUSTOMERACC_SWAGGER.success,
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