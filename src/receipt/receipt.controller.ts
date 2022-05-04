import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { ReceiptService } from './receipt.service';
import {
  receiptPhotoStorage,
  RECEIPT_PHOTOS_LIMIT,
  RECEIPT_ROUTES,
} from './receipt.constants';
import { User } from 'src/shared/decorators/user.decorator';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';

@ApiTags(RECEIPT_ROUTES.main)
@Controller(RECEIPT_ROUTES.main)
export class ReceiptController {
  constructor(private readonly ReceiptService: ReceiptService) {}

  @Post(RECEIPT_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(
    FilesInterceptor(
      'receipt_photos',
      RECEIPT_PHOTOS_LIMIT,
      receiptPhotoStorage,
    ),
  )
  public async creteReceipt(
    @User('id') id: string,
    @Body() body: CreateReceiptDTO,
    @UploadedFiles() files,
  ) {
    return await this.ReceiptService.createReceipt(id, body, files);
  }

  @Post(RECEIPT_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  public async getReceipts(
    @User('id') id: string,
    @Body() body: PaginationDTO,
  ) {
    return await this.ReceiptService.getReceipts(id, body);
  }

  @Put(RECEIPT_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  public async updateReceipt(@User('id') id: string, @Body() body: UpdateReceiptDTO) {
    return await this.ReceiptService.updateReceipt(id, body);
  }

  @Get(RECEIPT_ROUTES.get_image)
  public async findReceiptImage(
    @Param('imagename') imagename: string,
    @Res() res,
  ) {
    return await this.ReceiptService.getReceiptDetails(imagename, res);
  }

  @Delete(RECEIPT_ROUTES.delete_image)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceiptImage(
    @User('id') id: string,
    @Param('imagename') imagename: string,
  ) {
    return await this.ReceiptService.deleteImage(imagename);
  }

  @Delete(RECEIPT_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceipt(@User('id') id: string, @Param('id') receiptId) {
    return await this.ReceiptService.receiptDelete(id, receiptId);
  }
}
