import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new HttpException('TOKEN IS EXPIRED', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
