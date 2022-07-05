import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { MemberEntity } from 'src/company-member/entities/company-member.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    private configService: ConfigService,
    private s3Service: S3Service,
  ) {}

  private async extractCompanyFromUser(id: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }
    const account = await this.memberRepository.findOne({
      where: { id: user.active_account },
      relations: ['company'],
    });

    if (!account) {
      throw new HttpException(
        'COMPANY ACCOUNT NOT FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }
    const company = await this.companyRepository.findOne({
      where: { id: account.company.id },
      relations: ['currency'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  async getProfile(id: string) {
    const company = await this.extractCompanyFromUser(id);
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    return {
      user: {
        fullName: user.fullName,
        email: user.email,
        country: user.country,
      },
      company: {
        currency: company.currency,
        date_format: company.date_format,
      },
    };
  }

  async getProfileImage(imagename: string, res) {
    try {
      const readStream = await this.s3Service.getFilesStream(
        `profiles/${imagename}`,
      );
      readStream.pipe(res);
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async uploadProfileImage(id: string, file) {
    const user = await this.authRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new HttpException('USER IS NOT FOUND', HttpStatus.NOT_FOUND);
    }
    if (!file) {
      throw new HttpException('NO PROFILE IMAGE', HttpStatus.BAD_REQUEST);
    }
    if (!!user.profile_image) {
      await this.deleteProfileImage(id, user.profile_image);
    }
    const folderName = `profiles`;
    const { key, location } = await this.s3Service.loadFile(file, folderName);
    const imageName = key.split('/')[1];

    await this.authRepository.update(user.id, {
      profile_image: imageName,
    });
    return await this.authRepository.findOne({ where: { id: id } });
  }

  async deleteProfileImage(id: string, image_name: string) {
    const user = await this.authRepository.findOne({ where: { id: id } });
    if (user.profile_image !== image_name) {
      throw new HttpException(
        'YOU HAVE NO ACCESS TO DELETE THIS PHOTO',
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      await this.s3Service.deleteFile(`profiles/${image_name}`);
      return 'Profile image Delete Success';
    } catch (e) {
      console.log(e);
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async updateProfile(id: string, body: UpdateProfileDTO) {
    const { fullName, email, country, currency, date_format } = body;
    const company = await this.extractCompanyFromUser(id);
    const user = await this.authRepository.findOne({
      where: { id: id },
    });

    if (email && user.email !== email.toLowerCase()) {
      const isEmailBooked = await this.authRepository.findOne({
        where: { email: email.toLowerCase() },
      });
      if (isEmailBooked) {
        throw new HttpException(
          'User with this email already exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.authRepository.update(user.id, {
        email: email.toLowerCase(),
      });
    }

    if (currency && currency !== company.currency.id) {
      const newCurrency = await this.currencyRepository.findOne({
        where: {
          id: body.currency,
        },
      });
      if (!newCurrency) {
        throw new HttpException('Currency not found', HttpStatus.BAD_REQUEST);
      }
      await this.companyRepository.update(company.id, {
        currency: { id: newCurrency.id },
      });
    }

    await this.companyRepository.update(company.id, {
      date_format: date_format,
    });

    await this.authRepository.update(user.id, {
      fullName: fullName,
      country: country,
    });

    return await this.getProfile(id);
  }

  async changePassword(id: string, body: ChangePasswordDTO) {
    const user = await this.authRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!!user.password && !body.old_password) {
      throw new HttpException('Password is required', HttpStatus.FORBIDDEN);
    }

    if (
      !!user.password &&
      !(await bcrypt.compare(body.old_password, user.password))
    ) {
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
    }
    await this.addNewPassword(body.new_password, user.id);

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
