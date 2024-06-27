// create-expense.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { ExpenseStatus } from '../expense.constants';

export class CreateExpenseDTO {
  @ApiProperty({ required: false  ,default:null})
  @IsString()
  @IsOptional()
  report_for: string;

  @ApiProperty({ required: false  ,default:null})
  @IsString()
  @IsOptional()
  report_name: string;

  @ApiProperty({ required: false  ,default:null})
  @IsOptional()
  @IsArray()
  expenseReceipt: string[];

  @ApiProperty({ required: false  ,default:null})
  @IsOptional()
  @IsString()
  active_account?: string;

  @ApiProperty({ required: false  ,default:null})
  @IsOptional()
  @IsDateString()
  date?: Date;
}
