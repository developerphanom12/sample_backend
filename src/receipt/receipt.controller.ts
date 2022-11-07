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
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../shared/guards';
import { ReceiptService } from './receipt.service';
import {
  RECEIPT_PHOTOS_LIMIT,
  RECEIPT_ROUTES,
  RECEIPT_SWAGGER,
} from './receipt.constants';
import { User } from '../shared/decorators/user.decorator';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { ReceiptEntity } from './entities/receipt.entity';
import { DownloadCSVDTO } from './dto/download-csv.dto';
import { SendReceiptEmailDTO } from './dto/send-receipt-email.dto';

@ApiTags(RECEIPT_ROUTES.main)
@Controller(RECEIPT_ROUTES.main)
export class ReceiptController {
  constructor(private readonly ReceiptService: ReceiptService) {}

  @Post(RECEIPT_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FilesInterceptor('receipt_photos', RECEIPT_PHOTOS_LIMIT))
  @ApiOperation({ summary: RECEIPT_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: ReceiptEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async creteReceipt(
    @User('id') id: string,
    @Body() body: CreateReceiptDTO,
    @UploadedFiles() files,
  ) {
    return await this.ReceiptService.createReceipt(id, body, files);
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
    @Body() body: DownloadCSVDTO,
    @Res() res,
  ) {
    const result = await this.ReceiptService.downloadCSV(id, body);
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
    @Body() body: DownloadCSVDTO,
    @Res() res,
  ) {
    const result = await this.ReceiptService.downloadXLSX(id, body);
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
    return await this.ReceiptService.sendEmail(id, body);
  }

  @Get(RECEIPT_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: ReceiptEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getReceipts(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.ReceiptService.getReceipts(id, body);
  }

  @Put(RECEIPT_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: RECEIPT_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: RECEIPT_SWAGGER.success,
    type: ReceiptEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateReceipt(
    @User('id') id: string,
    @Body() body: UpdateReceiptDTO,
  ) {
    return await this.ReceiptService.updateReceipt(id, body);
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
    @Res() res,
  ) {
    return await this.ReceiptService.getReceiptImage(id, imagename, res);
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
  ) {
    return await this.ReceiptService.deleteImage(id, imagename);
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
    @Body() body: DownloadCSVDTO,
  ) {
    return await this.ReceiptService.receiptsDelete(id, body);
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
    @Body() body: DownloadCSVDTO,
  ) {
    return await this.ReceiptService.markReceiptsAsPaid(id, body);
  }
}
