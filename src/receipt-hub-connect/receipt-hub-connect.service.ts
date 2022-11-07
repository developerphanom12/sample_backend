import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDTO } from '../auth/dto/login.dto';
import { AuthEntity } from '../auth/entities/auth.entity';
import { EXPIRE_CAPIUM_JWT_TIME } from '../constants/jwt';
import { IRHconnect } from './receipt-hub-connect.types';

@Injectable()
export class ReceiptHubConnectService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async receiptHubConnect(data: LoginDTO): Promise<IRHconnect> {
    const { email, password } = data;
    const user = await this.authRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new HttpException('USER NOT EXIST', HttpStatus.NOT_FOUND);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('WRONG PASSWORD', HttpStatus.BAD_REQUEST);
    }
    const dataCapimToken = { id: user.id, expiresIn: EXPIRE_CAPIUM_JWT_TIME };
    const secretCapiumToken = await this.configService.get('JWT_SECRET');

    const access_token = await this.jwtService.sign(dataCapimToken, {
      secret: `${secretCapiumToken}${user.publicKey}`,
      expiresIn: EXPIRE_CAPIUM_JWT_TIME,
    });

    return {
      access_token,
    };
  }
}
