import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { UpdateUserInfoDTO } from './dto/update-user-info.dto';
import { UserInfoDTO } from './dto/user-info.dto';
import { UserInfoEntity } from './entities/user-info.entity';
import { USER_INFO_ROUTES, USER_INFO_SWAGGER } from './user-info.constants';
import { UserInfoService } from './user-info.service';

@ApiTags(USER_INFO_ROUTES.main)
@Controller(USER_INFO_ROUTES.main)
export class UserInfoController {
  constructor(private readonly UserInfoService: UserInfoService) {}

  @Post(USER_INFO_ROUTES.create)
  @ApiOperation({ summary: USER_INFO_SWAGGER.create })
  @UseGuards(new JwtAuthenticationGuard())
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_INFO_SWAGGER.success,
    type: UserInfoEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async createUserInfo(
    @Body() body: UserInfoDTO,
    @User('id') id: string,
  ) {
    return await this.UserInfoService.createUserInfo(id, body);
  }

  @Get(USER_INFO_ROUTES.get_user_info)
  @ApiOperation({ summary: USER_INFO_SWAGGER.get_user_info })
  @UseGuards(new JwtAuthenticationGuard())
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_INFO_SWAGGER.success,
    type: UserInfoEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async getUserInfo(@User('id') id: string) {
    return await this.UserInfoService.getUserInfo(id);
  }

  @Put(USER_INFO_ROUTES.update_user_info)
  @ApiOperation({ summary: USER_INFO_SWAGGER.update_user_info })
  @UseGuards(new JwtAuthenticationGuard())
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_INFO_SWAGGER.success,
    type: UserInfoEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async updateUserInfo(
    @User('id') id: string,
    @Body() body: UpdateUserInfoDTO,
  ) {
    return await this.UserInfoService.updateUserInfo(id, body);
  }
}
