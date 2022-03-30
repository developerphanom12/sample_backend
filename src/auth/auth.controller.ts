import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AUTH_ROUTES, AUTH_SWAGGER } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { AuthEntity } from './entityes/auth.entity';

@ApiBearerAuth()
@ApiTags(AUTH_ROUTES.main)
@Controller(AUTH_ROUTES.main)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
