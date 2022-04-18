import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { UpdateUserInfoDTO } from './dto/update-user-info.dto';
import { UserInfoDTO } from './dto/user-info.dto';
import { UserInfoEntity } from './entities/user-info.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(UserInfoEntity)
    private userInfoRepository: Repository<UserInfoEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async createUserInfo(id: string, body: UserInfoDTO) {
    const user = await this.authRepository.findOne({
      where: {
        id: id,
      },
      relations: ['userInfo'],
    });

    if (!user) {
      throw new HttpException('USER NOT EXIST', HttpStatus.NOT_FOUND);
    }

    if (user.userInfo) {
      throw new HttpException(
        'USER INFO ALREADY EXIST',
        HttpStatus.BAD_REQUEST,
      );
    }
    const currency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });

    if (!currency) {
      throw new HttpException(
        'CURRENCY DOES NOT EXIST',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUserInfo = await this.userInfoRepository.save({
      date_format: body.date_format,
      user,
      currency,
    });

    await this.authRepository.update(id, {
      isOnboardingDone: true,
    });

    return await this.userInfoRepository.findOne({
      where: {
        user: { id: user.id },
      },
      relations: ['user', 'currency'],
    });
  }

  async getUserInfo(id: string) {
    const userInfo = await this.userInfoRepository.findOne({
      where: {
        user: { id: id },
      },
      relations: ['currency'],
    });
    return userInfo;
  }

  async updateUserInfo(id: string, body: UpdateUserInfoDTO) {
    const user = await this.authRepository.findOne({
      where: {
        id: id,
      },
      relations: ['userInfo'],
    });

    if (!user.userInfo) {
      throw new HttpException('USER INFO NOT EXIST', HttpStatus.BAD_REQUEST);
    }

    const currency = await this.currencyRepository.findOne({
      where: { id: body.currency },
    });
    if (!currency) {
      throw new HttpException(
        'CURRENCY DOES NOT EXIST',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userInfoRepository.update(user.userInfo.id, {
      date_format: body.date_format,
      currency: currency,
    });

    return await this.userInfoRepository.findOne({
      where: {
        id: user.userInfo.id,
      },
      relations: ['currency'],
    });
  }
}
