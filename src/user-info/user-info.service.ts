import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { UpdateUserInfoDTO } from './dto/update-user-info.dto';
import { UserInfoDTO } from './dto/user-info.dto';
import { UserInfoEntity } from './entities/user-info.entity';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(UserInfoEntity)
    private userInfoRepository: Repository<UserInfoEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
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
    const payloadUserInfo = JSON.parse(JSON.stringify(body)); // Clear undefined

    await this.userInfoRepository.save({
      ...payloadUserInfo,
      user,
    });

    await this.authRepository.update(id, {
      isOnboardingDone: true,
    });

    return this.userInfoRepository.findOne({
      where: {
        user: { id: user.id },
      },
      relations: ['user'],
    });
  }

  async getUserInfo(id: string) {
    const user = await this.authRepository.findOne({
      where: {
        id: id,
      },
      relations: ['userInfo'],
    });

    return user.userInfo;
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

    await this.userInfoRepository.update(user.userInfo.id, {
      ...body,
    });

    return await this.userInfoRepository.findOne({
      where: {
        id: user.userInfo.id,
      },
    });
  }
}
