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
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../shared/guards';
import { ReceiptService } from './receipt.service';
import {
  receiptPhotoStorage,
  RECEIPT_PHOTOS_LIMIT,
  RECEIPT_ROUTES,
} from './receipt.constants';
import { User } from '../shared/decorators/user.decorator';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';

@ApiTags(RECEIPT_ROUTES.main)
@Controller(RECEIPT_ROUTES.main)
export class ReceiptController {
  constructor(private readonly ReceiptService: ReceiptService) {}

  @Post(RECEIPT_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FilesInterceptor('receipt_photos', RECEIPT_PHOTOS_LIMIT))
  public async creteReceipt(
    @User('id') id: string,
    @Body() body: CreateReceiptDTO,
    @UploadedFiles() files,
  ) {
    return await this.ReceiptService.createReceipt(id, body, files);
  }

  // @Post(`create-receipt`)
  // @UseGuards(new JwtAuthenticationGuard())
  // @ApiConsumes('multipart/form-data')
  // @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(FileInterceptor('file'))
  // public async postPhoto(
  //   @Body() body,
  //   @UploadedFile() file,
  //   @User('id') id: string,
  // ) {
  //   return this.ReceiptService.postPhoto(body, file, id);
  // }

  @Get(RECEIPT_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  public async getReceipts(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.ReceiptService.getReceipts(id, body);
  }

  @Put(RECEIPT_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  public async updateReceipt(
    @User('id') id: string,
    @Body() body: UpdateReceiptDTO,
  ) {
    return await this.ReceiptService.updateReceipt(id, body);
  }

  @Get(RECEIPT_ROUTES.get_image)
  @UseGuards(new JwtAuthenticationGuard())
  public async findReceiptImage(
    @User('id') id: string,
    @Param('imagename') imagename: string,
    @Res() res,
  ) {
    return await this.ReceiptService.getReceiptImage(id, imagename, res);
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
