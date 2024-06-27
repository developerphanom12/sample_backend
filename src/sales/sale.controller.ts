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
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { SendReceiptEmailDTO } from './dto/send-receipt-email.dto';
import { SaleEntity } from './entities/sale.entity';
import { RECEIPT_PHOTOS_LIMIT, RECEIPT_ROUTES, RECEIPT_SWAGGER } from './sales.constants';
import { CreatesaleDTO } from './dto/create-receipt.dto';
import { SalesDownloadCSVDTO } from './dto/download-csv.dto';
import { UpdateSaleDTO } from './dto/update-receipt.dto';
import { SaleService } from './sale.service';

@ApiTags(RECEIPT_ROUTES.main)
@Controller(RECEIPT_ROUTES.main)
export class SaleController {
  constructor(private readonly SaleService: SaleService) {}

  @Post(RECEIPT_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FilesInterceptor('receipt_photos', RECEIPT_PHOTOS_LIMIT))
  @ApiOperation({ summary: RECEIPT_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: SaleEntity,
  })     
  @HttpCode(HttpStatus.OK)
  public async creteSaleReceipt(
    @User('id') id: string,
    @Body() body: CreatesaleDTO,
    @UploadedFiles() files,
  ) {
    return await this.SaleService.createReceipt(id, body, files);
  }

  @Post(RECEIPT_ROUTES.download_csv)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.download_csv })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  public async downloadCSV(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
    @Res() res,
  ) {
    const result = await this.SaleService.downloadCSV(id, body);
    res.download(`${result}`);
  }

  @Post(RECEIPT_ROUTES.download_xlsx)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.download_xlsx })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
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

  @Post(RECEIPT_ROUTES.send_email)    
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.send_email })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async sendEmail(
    @User('id') id: string,
    @Body() body: SendReceiptEmailDTO,
  ) {
    return await this.SaleService.sendEmail(id, body);
  }

  @Get(RECEIPT_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: SaleEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getReceipts(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.SaleService.getReceipts(id, body);
  }

  @Put(RECEIPT_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: SaleEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateReceipt(
    @User('id') id: string,
    @Body() body: UpdateSaleDTO,
  ) {
    return await this.SaleService.updateReceipt(id, body);
  }

  @Get(RECEIPT_ROUTES.get_image)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.get_image })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
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

  @Delete(RECEIPT_ROUTES.delete_image)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.delete_image })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceiptImage(
    @User('id') id: string,
    @Param('imagename') imagename: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.SaleService.deleteImage(id, imagename, active_account);
  }

  @Delete(RECEIPT_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async deleteReceipts(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.receiptsDelete(id, body);
  }

  @Post(RECEIPT_ROUTES.mark_paid)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_paid })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsPaid(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsPaid(id, body);
  }


  @Post(RECEIPT_ROUTES.mark_unpaid)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_unpaid })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsunPaid(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsunPaid(id, body);
  }


  @Post(RECEIPT_ROUTES.mark_approved)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_approved })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsApproved(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsApproved(id, body);
  }

  @Post(RECEIPT_ROUTES.mark_rejected)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_rejected })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsRejected(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsRejected(id, body);
  }

  @Post(RECEIPT_ROUTES.mark_published)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_published })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsPublished(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsPublished(id, body);
  }


  @Post(RECEIPT_ROUTES.mark_unpublished)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.mark_unpublished })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsUnpublished(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsUnpublished(id, body);
  }


  @Post(RECEIPT_ROUTES.withdrawl_approval)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.withdrawl_approval })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsWithdrawlApproval(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsWithdrawlApproval(id, body);
  }

  @Post(RECEIPT_ROUTES.withdrawl_rejection)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.withdrawl_rejection })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async markReceiptsAsWithdrawlRejection(
    @User('id') id: string,
    @Body() body: SalesDownloadCSVDTO,
  ) {
    return await this.SaleService.markReceiptsAsWithdrawlRejection(id, body);
  }
}



