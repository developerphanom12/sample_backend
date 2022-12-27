import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import e = require('express');
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from 'src/shared/guards';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { PROFILE_ROUTES, PROFILE_SWAGGER } from './profile.constants';
import { ProfileService } from './profile.service';

@ApiTags(PROFILE_ROUTES.main)
@Controller(PROFILE_ROUTES.main)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(PROFILE_ROUTES.get)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PROFILE_SWAGGER.get })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getProfile(
    @User('id') id: string,
    @Query() body: { active_account?: string; isSkipOnboarding?: boolean },
  ) {
    return await this.profileService.getProfile(
      id,
      body?.active_account,
      body?.isSkipOnboarding,
    );
  }

  @Put(PROFILE_ROUTES.update)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PROFILE_SWAGGER.update })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async updateProfile(
    @User('id') id: string,
    @Body() body: UpdateProfileDTO,
  ) {
    return await this.profileService.updateProfile(id, body);
  }

  @Put(PROFILE_ROUTES.change_password)
  @UseGuards(new JwtAuthenticationGuard())
  @ApiOperation({ summary: PROFILE_SWAGGER.change_password })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async changePassword(
    @User('id') id: string,
    @Body() body: ChangePasswordDTO,
  ) {
    return await this.profileService.changePassword(id, body);
  }

  @Post(PROFILE_ROUTES.upload_photo)
  @UseGuards(new JwtAuthenticationGuard())
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiOperation({ summary: PROFILE_SWAGGER.upload_photo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async uploadAvatar(@User('id') id: string, @UploadedFile() file) {
    return await this.profileService.uploadProfileImage(id, file);
  }

  @Get(PROFILE_ROUTES.get_photo)
  @ApiOperation({ summary: PROFILE_SWAGGER.get_photo })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getAvatar(@Param('imagename') imagename: string, @Res() res) {
    return await this.profileService.getProfileImage(imagename, res);
  }

  @Get(PROFILE_ROUTES.get_avatar_name)
  @ApiOperation({ summary: PROFILE_SWAGGER.get_avatar_name })
  @ApiResponse({
    status: HttpStatus.OK,
    description: PROFILE_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async getAvatarName(@User('id') id: string) {
    return await this.profileService.getAvatarName(id);
  }
}
