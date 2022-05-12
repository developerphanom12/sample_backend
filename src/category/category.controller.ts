import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { CATEGORY_ROUTES } from './category.constants';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';

@ApiTags(CATEGORY_ROUTES.main)
@Controller(CATEGORY_ROUTES.main)
export class CategoryController {
  constructor(private readonly CategoryService: CategoryService) {}

  @Post(CATEGORY_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  public async createCategory(
    @User('id') id: string,
    @Body() body: CreateCategoryDTO,
  ) {
    return await this.CategoryService.createCategory(id, body);
  }

  @Put(CATEGORY_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  public async updateCategory(
    @User('id') id: string,
    @Body() body: UpdateCategoryDTO,
  ) {
    return await this.CategoryService.updateCategory(id, body);
  }

  @Get(CATEGORY_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  public async getCategory(
    @User('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    return await this.CategoryService.getCategoryDetails(id, categoryId);
  }

  @Get(CATEGORY_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  public async getAllCategories(@User('id') id: string) {
    return await this.CategoryService.getAllCategories(id);
  }

  @Get(CATEGORY_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  public async getCategories(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.CategoryService.getCategories(id, body);
  }

  @Delete(CATEGORY_ROUTES.delete)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceipt(
    @User('id') id: string,
    @Param('categoryId') categoryId,
  ) {
    return await this.CategoryService.deleteCategory(id, categoryId);
  }
}
