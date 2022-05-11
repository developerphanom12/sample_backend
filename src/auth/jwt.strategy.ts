import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (
        request: Request,
        rawJwtToken: string,
        done: (err: any, secret: string) => void,
      ) => {
        const decodedToken: { id: string } = jwt.decode(rawJwtToken) as {
          id: string;
        };
        const user = await this.authService.getById(decodedToken.id);
        const JWT_SECRET = this.configService.get('JWT_SECRET');
        done(null, `${JWT_SECRET}${user?.publicKey}`);
      },
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.expiresIn || Date.now() > payload.expiresIn) {
      throw new HttpException('TOKEN HAS EXPIRED', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.getById(payload.id);
  }
}
