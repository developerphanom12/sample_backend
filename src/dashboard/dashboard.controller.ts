import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { DASHBOARD_ROUTES, DASHBOARD_SWAGGER } from './dashboard.constants';
import { DashboardService } from './dashboard.service';
import { DashboardStatisticDTO } from './dto/dashboard-get-statistic.dto';

@ApiTags(DASHBOARD_ROUTES.main)
@Controller(DASHBOARD_ROUTES.main)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(DASHBOARD_ROUTES.statistic)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: DASHBOARD_SWAGGER.get_statistic })
  @ApiResponse({
    status: HttpStatus.OK,
    description: DASHBOARD_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  async getDashboardData(@User('id') id, @Query() body: DashboardStatisticDTO) {
    return await this.dashboardService.getDashboardInfo(id, body);
  }
  @Get('get-user')
  @HttpCode(HttpStatus.OK)
  async getUser(@Query() { active_account }) {
    return await this.dashboardService.getUser(active_account);
  }
}
