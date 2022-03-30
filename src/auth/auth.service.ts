import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from './entityes/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { EXPIRE_JWT_TIME } from 'src/constants/jwt';
import * as bcrypt from 'bcrypt';
import { deserialize, serialize } from 'class-transformer';
import { RegistrationDTO } from './dto/registration.dto';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private configService: ConfigService,
  ) {}

  async createToken(user: AuthEntity) {
    const expiresIn = EXPIRE_JWT_TIME + Date.now();
    const data = { id: user.id, expiresIn };
    const secret = await this.createSecretString(user.publicKey);
    return this.jwtService.sign(data, { secret });
  }

  async signUp(body: RegistrationDTO) {
    const user = await this.authRepository.findOne({
      where: { email: body.email.toLowerCase() },
    });
    if (user) {
      throw new HttpException('USER ALREADY EXIST', HttpStatus.CONFLICT);
    }
    const publicKey = await bcrypt.genSalt(6);
    const newPassword = await bcrypt.hash(body.password, 10);

    const newUser = await this.authRepository.save({
      ...body,
      email: body.email.toLowerCase(),
      fullName: body.fullName.trim(),
      country: body.country.trim(),
      password: newPassword,
      publicKey,
    });

    const token = await this.createToken(newUser);
    return { user: await this.userSerializer(newUser), token };
  }

  async signIn(data: LoginDTO) {
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
    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      showSetPassword: !!user.email && !user.password,
    };
  }

  private async createSecretString(personalKey: string) {
    const secret = await this.configService.get('JWT_SECRET');
    return `${secret}${personalKey}`;
  }
  async userSerializer(user: AuthEntity) {
    const serializedUser = serialize(user);
    return deserialize(AuthEntity, serializedUser);
  }

  async getById(id: string) {
    return this.authRepository.findOne({
      where: {
        id,
      },
    });
  }
}
