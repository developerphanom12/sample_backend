// expense.controller.ts
import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../shared/guards';
import { User } from '../shared/decorators/user.decorator';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { ExpenseService } from './expense.service';
import { ExpenseEntity } from './entities/expense.entity';
import { EXPENSE_ROUTES, EXPENSE_SWAGGER } from './expense.constants';
import { PaginationDTO } from './dto/update-expense.dto';

@ApiTags(EXPENSE_ROUTES.main)
@Controller(EXPENSE_ROUTES.main)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post(EXPENSE_ROUTES.create)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: EXPENSE_SWAGGER.create })
  @ApiResponse({
    status: HttpStatus.OK,
    description: EXPENSE_SWAGGER.success,
    type: ExpenseEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createExpenseReceipt(
    @User('id') id: string,
    @Body() body: CreateExpenseDTO,
  ) {
    return await this.expenseService.createExpense(id, body);
  }

  @Get(EXPENSE_ROUTES.get_all)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: EXPENSE_SWAGGER.get_all })
  @ApiResponse({
    status: HttpStatus.OK,
    description: EXPENSE_SWAGGER.success,
    type: ExpenseEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getReceipts(
    @User('id') id: string,
    @Query() body: PaginationDTO,
  ) {
    return await this.expenseService.getReceipts(id, body);
  }


}
