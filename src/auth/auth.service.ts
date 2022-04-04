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
import { SocialLoginDTO } from './dto/social-auth.dto';
import { SocialAuthEntity } from './entityes/social-auth.entity';
import { UserInfoEntity } from 'src/user-info/entityes/user-info.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(SocialAuthEntity)
    private socialAuthRepository: Repository<SocialAuthEntity>,
    @InjectRepository(UserInfoEntity)
    private userInfoRepository: Repository<UserInfoEntity>,
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

    return {
      user: await this.userSerializer(newUser),
      token: await this.createToken(newUser),
    };
  }

  async signIn(data: LoginDTO) {
    const { email, password } = data;
    const user = await this.authRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['socialAuth', 'userInfo'],
    });

    if (!user) {
      throw new HttpException('USER NOT EXIST', HttpStatus.NOT_FOUND);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('WRONG PASSWORD', HttpStatus.BAD_REQUEST);
    }
    if (!user.userInfo) {
      return {
        user: await this.userSerializer(user),
        token: await this.createToken(user),
        user_info: null,
        socialAuth: null,
      };
    }
    const serializedUserInfo = serialize(user.userInfo);
    if (!user.socialAuth) {
      return {
        user: await this.userSerializer(user),
        token: await this.createToken(user),
        user_info: await deserialize(UserInfoEntity, serializedUserInfo),
        socialAuth: null,
        showSetPassword: !!user.email && !user.password,
      };
    }
    const serializedSocialAuth = serialize(user.socialAuth);
    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      user_info: await deserialize(UserInfoEntity, serializedUserInfo),
      socialAuth: await deserialize(SocialAuthEntity, serializedSocialAuth),
      showSetPassword: !!user.email && !user.password,
    };
  }

  async socialSignIn(data: SocialLoginDTO) {
    const { socialAccountId, type } = data;

    const socialAccount = await this.socialAuthRepository.findOne({
      where: { [`${type.toLowerCase()}Id`]: socialAccountId },
      relations: ['auth'],
    });

    if (!socialAccount) {
      const publicKey = await bcrypt.genSalt(6);
      const { email, fullName } = data;
      const newUser = await this.authRepository.save({
        fullName: fullName ? fullName.trim() : '',
        publicKey,
      });
      await this.socialAuthRepository.save({
        [`${type.toLowerCase()}Id`]: socialAccountId,
        [`${type.toLowerCase()}Email`]: email,
        auth: newUser,
      });

      const token = await this.createToken(newUser);
      return {
        user: await this.userSerializer(newUser),
        user_info: null,
        socialAccount: await this.socialAuthRepository.findOne({
          where: { [`${type.toLowerCase()}Id`]: socialAccountId },
        }),
        token,
      };
    }

    const user = await this.authRepository.findOne({
      where: { id: socialAccount.auth.id },
      relations: ['userInfo'],
    });

    const userInfo = user.userInfo;
    if (!userInfo) {
      return {
        user: await this.userSerializer(user),
        token: await this.createToken(user),
        user_info: null,
        socialAccount: await this.socialAuthRepository.findOne({
          where: { [`${type.toLowerCase()}Id`]: socialAccountId },
        }),
      };
    }
    const serializedUserInfo = serialize(userInfo);
    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      user_info: await deserialize(UserInfoEntity, serializedUserInfo),
      socialAccount: await this.socialAuthRepository.findOne({
        where: { [`${type.toLowerCase()}Id`]: socialAccountId },
      }),
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
