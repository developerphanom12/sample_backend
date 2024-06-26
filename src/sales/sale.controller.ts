import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../shared/guards';
import { User } from '../shared/decorators/user.decorator';
import {
  SALE_PHOTOS_LIMIT,
  SALE_ROUTES,
  SALE_SWAGGER,
} from './sales.constants';
import { SalesEntity } from './entities/sale.entity';
import { SaleService } from './sale.service';
import { CreatesaleDTO } from './dto/create-receipt.dto';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { UpdateSaleDTO } from './dto/update-receipt.dto';
import { SalesDownloadCSVDTO } from './dto/download-csv.dto';
import { SendReceiptEmailDTO } from './dto/send-receipt-email.dto';

@ApiTags(SALE_ROUTES.main)
@Controller(SALE_ROUTES.main)
export class SaleController {
  constructor(private readonly SaleService: SaleService) {}

  @Post(SALE_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FilesInterceptor('receipt_photos', SALE_PHOTOS_LIMIT))
  @ApiOperation({ summary: SALE_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
    type: SalesEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async creteReceipt(
    @User('id') id: string,
    @Body() body: CreatesaleDTO,
    @UploadedFiles() files,
  ) {
    return await this.SaleService.createReceipt(id, body, files);
  }

  @Get(SALE_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
    type: SalesEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getReceipts(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.SaleService.getReceipts(id, body);
  }

  @Put(SALE_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
    type: SalesEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateReceipt(
    @User('id') id: string,
    @Body() body: UpdateSaleDTO,
  ) {
    return await this.SaleService.updateReceipt(id, body);
  }

  @Get(SALE_ROUTES.get_image)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.get_image })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async findReceiptImage(
    @User('id') id: string,
    @Param('imagename') imagename: string,
    @Query('active_account') active_account: string,
    @Res() res,
  ) {
    return await this.SaleService.getReceiptImage(
      id,
      imagename,
      res,
      active_account,
    );
  }

  @Post(SALE_ROUTES.download_csv)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.download_csv })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  public async downloadCSV(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
    @Res() res,
  ){
    const result = await this.SaleService.downloadCSV(id, body);
    res.download(`${result}`);
  }

  @Post(SALE_ROUTES.send_email)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.send_email })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async sendEmail(
    @User('id') id: string,
    @Body() body: SendReceiptEmailDTO,
  ) {
    return await this.SaleService.sendEmail(id, body);
  }

  @Delete(SALE_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceipts(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.receiptsDelete(id, body);
  }

  @Post(SALE_ROUTES.download_xlsx)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.download_xlsx })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/xlsx')
  public async downloadXLSX(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
    @Res() res,
  ) {
    const result = await this.SaleService.downloadXLSX(id, body);
    res.download(`${result}`);
  }

  @Delete(SALE_ROUTES.delete_image)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.delete_image })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceiptImage(
    @User('id') id: string,
    @Param('imagename') imagename: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.SaleService.deleteImage(id, imagename, active_account);
  }

  @Post(SALE_ROUTES.mark_paid)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.mark_paid })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsPaid(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsPaid(id, body);
  }

  @Post(SALE_ROUTES.mark_unpaid)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.mark_paid })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsunPaid(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsunPaid(id, body);
  }

  @Post(SALE_ROUTES.mark_approved)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.mark_approved })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsApproved(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsApproved(id, body);
  }


  @Post(SALE_ROUTES.mark_rejected)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: SALE_SWAGGER.mark_rejected })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SALE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsRejected(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsRejected(id, body);
  }


}
