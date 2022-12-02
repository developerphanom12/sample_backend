import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../shared/decorators/user.decorator';
import { JwtAuthenticationGuard } from '../shared/guards';
import { AUTH_ROUTES, AUTH_SWAGGER } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { PasswordRequestDTO } from './dto/password-request.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { PasswordRequestRedirectDTO } from './dto/reset-password-request-redirect.dto';
import { SocialLoginDTO } from './dto/social-auth.dto';
import { AuthEntity } from './entities/auth.entity';
import { Response } from 'express';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { ResetPasswordDTO } from './dto/resset-password.dto';
import { FRONT_END_URL } from '../constants/config';
import { InviteMemberRequestRedirectDTO } from './dto/invite-member-request-redirect.dto';
import { RtGuard } from '../shared/guards/rt.guard';
import { GetUserRefreshToken } from '../shared/decorators/get-user-refresh-token.decorator';
import { BindSocialAccountDTO } from './dto/bind-social-account.dto';

@ApiBearerAuth()
@ApiTags(AUTH_ROUTES.main)
@Controller(AUTH_ROUTES.main)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(AUTH_ROUTES.redirect_member)
  @HttpCode(HttpStatus.OK)
  public async redirectMember(
    @Param() params: InviteMemberRequestRedirectDTO,
    @Res() res: Response,
  ) {
    try {
      const link = `${FRONT_END_URL.development}signup-new-member/${params.token}`;
      return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Post(AUTH_ROUTES.sign_up)
  @ApiOperation({ summary: AUTH_SWAGGER.sign_up })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_SWAGGER.sign_up,
    type: AuthEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async signUp(@Body() body: RegistrationDTO) {
    return await this.authService.signUp(body);
  }

  @Post(AUTH_ROUTES.sign_in)
  @ApiOperation({ summary: AUTH_SWAGGER.sign_in })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_SWAGGER.success,
    type: AuthEntity,
  })
  @HttpCode(HttpStatus.OK)
  public async signIn(@Body() body: LoginDTO) {
    return await this.authService.signIn(body);
  }

  @Post(AUTH_ROUTES.o_auth)
  @ApiOperation({ summary: AUTH_SWAGGER.sign_in })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  public async socialSignIn(@Body() body: SocialLoginDTO) {
    return await this.authService.socialSignIn(body);
  }

  @Put(AUTH_ROUTES.log_out)
  @ApiOperation({ summary: AUTH_SWAGGER.log_out })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(new JwtAuthenticationGuard())
  public async logout(@User('id') id: string) {
    return await this.authService.logOut(id);
  }

  @Post(AUTH_ROUTES.refresh_tokens)
  @ApiOperation({ summary: AUTH_SWAGGER.refresh_tokens })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_SWAGGER.success,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  public async refreshToken(
    @User('id') id: string,
    @GetUserRefreshToken('refreshToken') refreshToken: string,
  ) {
    return await this.authService.refreshTokens(id, refreshToken);
  }

  @Get(AUTH_ROUTES.reset_password_request)
  @HttpCode(HttpStatus.OK)
  public async resetPasswordRequest(@Query() body: PasswordRequestDTO) {
    return await this.authService.updatePasswordRequest(body);
  }

  @Get(AUTH_ROUTES.redirect_password)
  @HttpCode(HttpStatus.OK)
  public async redirectPassword(
    @Param() params: PasswordRequestRedirectDTO,
    @Res() res: Response,
  ) {
    try {
      const link = `${FRONT_END_URL.development}reset-password/${params.token}`;
      return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Get(AUTH_ROUTES.redirect_bind_social_account)
  @HttpCode(HttpStatus.OK)
  public async redirectBindSocialAccount(
    @Param() params: PasswordRequestRedirectDTO,
    @Res() res: Response,
  ) {
    try {
      const link = `${FRONT_END_URL.development}bind-social-account/${params.token}`;
      return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Patch(AUTH_ROUTES.bind_social_account)
  @HttpCode(HttpStatus.OK)
  public async bindSocialAccount(@Body() body: BindSocialAccountDTO) {
    return await this.authService.bindSocialAccount(body);
  }

  @Put(AUTH_ROUTES.update_password)
  @HttpCode(HttpStatus.OK)
  public async updatePassword(@Body() body: UpdatePasswordDTO) {
    return await this.authService.updatePassword(body);
  }

  @Put(AUTH_ROUTES.reset_password)
  @HttpCode(HttpStatus.OK)
  @UseGuards(new JwtAuthenticationGuard())
  public async resetPassword(
    @User('id') id: string,
    @Body() body: ResetPasswordDTO,
  ) {
    return await this.authService.resetPassword(id, body);
  }
}
