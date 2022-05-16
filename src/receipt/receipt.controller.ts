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
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../shared/guards';
import { ReceiptService } from './receipt.service';
import {
  receiptPhotoStorage,
  RECEIPT_PHOTOS_LIMIT,
  RECEIPT_ROUTES,
  RECEIPT_SWAGGER,
} from './receipt.constants';
import { User } from '../shared/decorators/user.decorator';
import { PaginationDTO } from './dto/receipt-pagination.dto';
import { CreateReceiptDTO } from './dto/create-receipt.dto';
import { UpdateReceiptDTO } from './dto/update-receipt.dto';
import { ReceiptEntity } from './entities/receipt.entity';

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
  public async deleteReceipt(@User('id') id: string, @Param('id') receiptId) {
    return await this.ReceiptService.receiptDelete(id, receiptId);
  }
}
