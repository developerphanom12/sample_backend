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
import { CATEGORY_ROUTES, CATEGORY_SWAGGER } from './category.constants';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags(CATEGORY_ROUTES.main)
@Controller(CATEGORY_ROUTES.main)
export class CategoryController {
  constructor(private readonly CategoryService: CategoryService) {}

  @Post(CATEGORY_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CATEGORY_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
    type: CategoryEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createCategory(
    @User('id') id: string,
    @Body() body: CreateCategoryDTO,
  ) {
    return await this.CategoryService.createCategory(id, body);
  }

  @Put(CATEGORY_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CATEGORY_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
    type: CategoryEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateCategory(
    @User('id') id: string,
    @Body() body: UpdateCategoryDTO,
  ) {
    return await this.CategoryService.updateCategory(id, body);
  }

  @Get(CATEGORY_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CATEGORY_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
    type: CategoryEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCategory(
    @User('id') id: string,
    @Param('categoryId') categoryId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CategoryService.getCategoryDetails(
      id,
      categoryId,
      active_account,
    );
  }

  @Get(CATEGORY_ROUTES.get_all)
  @ApiOperation({ summary: CATEGORY_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
    type: CategoryEntity,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(new JwtAuthenticationGuard())
  public async getAllCategories(
    @User('id') id: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CategoryService.getAllCategories(id, active_account);
  }

  @Get(CATEGORY_ROUTES.get_many)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: CATEGORY_SWAGGER.get_many })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
    type: CategoryEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getCategories(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.CategoryService.getCategories(id, body);
  }

  @Delete(CATEGORY_ROUTES.delete)
  @ApiOperation({ summary: CATEGORY_SWAGGER.delete })
  @ApiResponse({
    status: HttpStatus.OK,
    description: CATEGORY_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(new JwtAuthenticationGuard())
  public async deleteReceipt(
    @User('id') id: string,
    @Param('categoryId') categoryId: string,
    @Query('active_account') active_account: string,
  ) {
    return await this.CategoryService.deleteCategory(
      id,
      categoryId,
      active_account,
    );
  }
}
