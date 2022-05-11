import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { CreatePaymentTypeDTO } from './dto/create-payment-type.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePaymentTypeDTO } from './dto/update-payment-type.dto';
import { PAYMENT_TYPE_ROUTES } from './payment-type.constants';
import { PaymentTypeService } from './payment-type.service';


@ApiTags(PAYMENT_TYPE_ROUTES.main)
@Controller(PAYMENT_TYPE_ROUTES.main)
export class PaymentTypeController {
  constructor(private readonly paymentTypeService: PaymentTypeService) {}

  @Post(PAYMENT_TYPE_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  public async createSupplier(
    @User('id') id: string,
    @Body() body: CreatePaymentTypeDTO,
  ) {
    return await this.paymentTypeService.createPaymentType(id, body);
  }

  @Put(PAYMENT_TYPE_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  public async updateSupplier(
    @User('id') id: string,
    @Body() body: UpdatePaymentTypeDTO,
  ) {
    return await this.paymentTypeService.updatePaymentType(id, body);
  }

  @Get(PAYMENT_TYPE_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  public async getSupplier(
    @User('id') id: string,
    @Param('paymentTypeId') paymentTypeId: string,
  ) {
    return await this.paymentTypeService.getPaymentTypeDetails(id, paymentTypeId);
  }

  @Get(PAYMENT_TYPE_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  public async getAllSuppliers(@User('id') id: string) {
    return await this.paymentTypeService.getAllPaymentTypes(id);
  }

  @Get(PAYMENT_TYPE_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  public async getSuppliers(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.paymentTypeService.getPaymentTypes(id, body);
  }

  @Delete(PAYMENT_TYPE_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceipt(@User('id') id: string, @Param('paymentTypeId') paymentTypeId) {
    return await this.paymentTypeService.deletePaymentType(id, paymentTypeId);
  }
}
