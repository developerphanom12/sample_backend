import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { EXPIRE_JWT_TIME, EXPIRE_LINK_TIME } from '../constants/jwt';
import * as ses from 'node-ses';
import * as bcrypt from 'bcrypt';
import { deserialize, serialize } from 'class-transformer';
import { RegistrationDTO } from './dto/registration.dto';
import { LoginDTO } from './dto/login.dto';
import { SocialLoginDTO } from './dto/social-auth.dto';
import { SocialAuthEntity } from './entities/social-auth.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { EOAuthTypes } from './auth.constants';
import { ResetPasswordEntity } from './entities/reset-password.entity';
import { v4 as uuid } from 'uuid';
import { PasswordRequestDTO } from './dto/password-request.dto';
import { ResetPasswordDTO } from './dto/resset-password.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { createPasswordMailSes } from '../shared/emails/create-password-email';
import { CompanyEntity } from '../company/entities/company.entity';
import { EmailsService } from 'src/emails/emails.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(SocialAuthEntity)
    private socialAuthRepository: Repository<SocialAuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(ResetPasswordEntity)
    private resetPasswordRepository: Repository<ResetPasswordEntity>,
    private configService: ConfigService,
    private emailsService: EmailsService,
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
      currencies: await this.currencyRepository.find(),
    };
  }

  async signIn(data: LoginDTO) {
    const { email, password } = data;
    const user = await this.authRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['socialAuth', 'accounts'],
    });

    if (!user) {
      throw new HttpException('USER NOT EXIST', HttpStatus.NOT_FOUND);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('WRONG PASSWORD', HttpStatus.BAD_REQUEST);
    }
    if (!user.accounts || user.accounts.length === 0) {
      return {
        user: await this.userSerializer(user),
        token: await this.createToken(user),
        socialAuth: null,
        currencies: await this.currencyRepository.find(),
      };
    }
    if (!user.socialAuth) {
      return {
        user: await this.userSerializer(user),
        token: await this.createToken(user),
        socialAuth: null,
        showSetPassword: !!user.email && !user.password,
        currencies: await this.currencyRepository.find(),
      };
    }
    const serializedSocialAuth = serialize(user.socialAuth);
    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      socialAuth: await deserialize(SocialAuthEntity, serializedSocialAuth),
      showSetPassword: !!user.email && !user.password,
      currencies: await this.currencyRepository.find(),
    };
  }

  async socialSignIn(data: SocialLoginDTO) {
    const { socialAccountId, type } = data;

    if (type === EOAuthTypes.capium) {
      return await this.signInWithCapium(data);
    }

    if (!data.socialAccountId) {
      throw new HttpException(
        'Apple should contain id',
        HttpStatus.BAD_REQUEST,
      );
    }
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
        socialAccount: await this.socialAuthRepository.findOne({
          where: { [`${type.toLowerCase()}Id`]: socialAccountId },
        }),
        token,
        currencies: await this.currencyRepository.find(),
      };
    }

    const user = await this.authRepository.findOne({
      where: { id: socialAccount.auth.id },
      relations: ['accounts'],
    });
    const account = user.active_account;

    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      socialAccount: await this.socialAuthRepository.findOne({
        where: { [`${type.toLowerCase()}Id`]: socialAccountId },
      }),
      showSetPassword: !!user.email && !user.password,
      currencies: await this.currencyRepository.find(),
    };
  }

  async signInWithCapium(data: SocialLoginDTO) {
    const { email, type } = data;

    if (!data.email) {
      throw new HttpException(
        'Capium should contain email',
        HttpStatus.BAD_REQUEST,
      );
    }
    const socialAccount = await this.socialAuthRepository.findOne({
      where: { [`${type.toLowerCase()}Email`]: data.email },
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
        [`${type.toLowerCase()}Email`]: email,
        auth: newUser,
      });

      const token = await this.createToken(newUser);
      return {
        user: await this.userSerializer(newUser),
        socialAccount: await this.socialAuthRepository.findOne({
          where: { [`${type.toLowerCase()}Email`]: email },
        }),
        token,
        currencies: await this.currencyRepository.find(),
      };
    }

    const user = await this.authRepository.findOne({
      where: { id: socialAccount.auth.id },
    });

    return {
      user: await this.userSerializer(user),
      token: await this.createToken(user),
      socialAccount: await this.socialAuthRepository.findOne({
        where: { [`${type.toLowerCase()}Email`]: email },
      }),
      showSetPassword: !!user.email && !user.password,
      currencies: await this.currencyRepository.find(),
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

  async getById(userId: string) {
    return this.authRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async logOut(userId: string) {
    const user = await this.authRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    }

    const publicKey = await bcrypt.genSalt(6);

    await this.authRepository.save({
      ...user,
      publicKey,
    });
    return {
      message: 'Success',
    };
  }

  async updatePasswordRequest(body: PasswordRequestDTO) {
    const { email } = body;

    const user = await this.authRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      throw new HttpException('Wrong email', HttpStatus.NOT_FOUND);
    }

    const isSend = await this.resetPasswordRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (isSend) {
      await this.resetPasswordRepository.delete(isSend.id);
    }

    const token = uuid();
    await this.resetPasswordRepository.save({
      email: email.toLowerCase(),
      token,
    });

    return await this.emailsService.sendResetPasswordEmail({
      email: email.toLowerCase(),
      token,
      name: user.fullName,
      host_url: this.configService.get('HOST_URL'),
    });
  }

  async updatePassword(body: UpdatePasswordDTO) {
    const resetPassModel = await this.resetPasswordRepository.findOne({
      where: { token: body.token },
    });

    if (!resetPassModel) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.authRepository.findOne({
      where: {
        email: resetPassModel.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      resetPassModel &&
      new Date().getTime() - new Date(resetPassModel.created).getTime() >
        EXPIRE_LINK_TIME
    ) {
      await this.resetPasswordRepository.delete(resetPassModel.id);
      throw new HttpException(
        'Reset password link is expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.addNewPassword(body.newPassword, user.id);

    await this.resetPasswordRepository.delete(resetPassModel.id);

    return {
      message: 'The password has been updated',
    };
  }

  async resetPassword(userId: string, body: ResetPasswordDTO) {
    const user = await this.authRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      !!user.password &&
      !(await bcrypt.compare(body.password, user.password))
    ) {
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
    }
    await this.addNewPassword(body.newPassword, user.id);

    return {
      message: 'The password has been updated',
    };
  }

  async addNewPassword(password: string, userId: string) {
    const newPassword = await bcrypt.hash(password, 10);
    await this.authRepository.update(userId, {
      password: newPassword,
    });
  }
}
