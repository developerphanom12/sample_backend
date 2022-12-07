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
import { CreatePaymentTypeDTO } from './dto/create-payment-type.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePaymentTypeDTO } from './dto/update-payment-type.dto';
import { PaymentTypeEntity } from './entities/payment-type.entity';
import {
  PAYMENT_TYPE_ROUTES,
  PAYMENT_TYPE_SWAGGER,
} from './payment-type.constants';
import { PaymentTypeService } from './payment-type.service';

@ApiTags(PAYMENT_TYPE_ROUTES.main)
@Controller(PAYMENT_TYPE_ROUTES.main)
export class PaymentTypeController {
  constructor(private readonly paymentTypeService: PaymentTypeService) {}

  @Post(PAYMENT_TYPE_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createSupplier(
    @User('id') id: string,
    @Body() body: CreatePaymentTypeDTO,
  ) {
    return await this.paymentTypeService.createPaymentType(id, body);
  }

  @Put(PAYMENT_TYPE_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdatePaymentTypeDTO,
  ) {
    return await this.paymentTypeService.updatePaymentType(id, body);
  }

  @Get(PAYMENT_TYPE_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSupplier(
    @User('id') id: string,
    @Param('paymentTypeId') paymentTypeId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.paymentTypeService.getPaymentTypeDetails(
      id,
      paymentTypeId,
      active_account,
    );
  }

  @Get(PAYMENT_TYPE_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getAllSuppliers(
    @User('id') id: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.paymentTypeService.getAllPaymentTypes(id, active_account);
  }

  @Get(PAYMENT_TYPE_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.paymentTypeService.getPaymentTypes(id, body);
  }

  @Delete(PAYMENT_TYPE_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PAYMENT_TYPE_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PAYMENT_TYPE_SWAGGER.success,
    type: PaymentTypeEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceipt(
    @User('id') id: string,
    @Param('paymentTypeId') paymentTypeId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.paymentTypeService.deletePaymentType(
      id,
      paymentTypeId,
      active_account,
    );
  }
}
