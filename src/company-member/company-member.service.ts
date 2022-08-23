import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Repository } from 'typeorm';
import { EmailsService } from '../emails/emails.service';
import { ECompanyRoles } from './company-member.constants';
import { CreateCompanyAccountDTO } from './dto/create-account.dto';
import { UpdateCompanyAccountDTO } from './dto/update-account.dto';
import { MemberEntity } from './entities/company-member.entity';
import { S3Service } from '../s3/s3.service';
import { Readable } from 'typeorm/platform/PlatformTools';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InviteNewMemberService } from '../invite-new-member/invite-new-member.service';
import { MemberInvitesEntity } from '../invite-new-member/entities/company-member-invites.entity';
@Injectable()
export class CompanyMemberService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private emailService: EmailsService,
    private configService: ConfigService,
    private s3Service: S3Service,
    private jwtService: JwtService,
    private inviteNewMemberService: InviteNewMemberService,
  ) {}

  private async extractUserAccount(id: string) {
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
    return account;
  }

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
      relations: ['members'],
    });

    if (!company) {
      throw new HttpException('COMPANY NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return company;
  }

  private async createToken(tokenPayload: {
    email: string;
    id: string;
  }): Promise<string> {
    const token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '48h',
    });
    return token;
  }

  private async extractDataFromUser(id: string) {
    const userInvitor = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });

    if (!userInvitor) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }
    const accounts = await this.memberRepository.find({
      where: { user: { id: userInvitor.id } },
      relations: ['company'],
    });

    if (!accounts.length) {
      throw new HttpException(
        'COMPANY ACCOUNTS NOT FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }

    const companies = await Promise.all(
      accounts.map((acc) =>
        this.companyRepository.findOne({
          where: { id: acc.company.id },
          relations: ['members'],
        }),
      ),
    );

    if (!companies.length) {
      throw new HttpException('COMPANIES NOT FOUND', HttpStatus.BAD_REQUEST);
    }
    return { companies, accounts, userInvitor };
  }

  async selectActiveAccount(id: string, accountId: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.NOT_FOUND);
    }
    const account = await this.memberRepository.findOne({
      where: { id: accountId },
      relations: ['user', 'company'],
    });
    if (!account) {
      throw new HttpException('ACCOUNT DOES NOT EXIST', HttpStatus.NOT_FOUND);
    }

    if (account.user.id !== user.id) {
      throw new HttpException(
        'USER HASN`T ACCESS TO THIS ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.authRepository.update(user.id, {
      active_account: account.id,
    });

    return {
      user: await this.authRepository.findOne({
        where: { id: user.id },
        relations: ['accounts'],
      }),
      company: await this.companyRepository.findOne({
        where: { id: account.company.id },
      }),
    };
  }

  async getUserAccounts(id: string) {
    const user = await this.authRepository.findOne({
      where: { id: id },
      relations: ['accounts'],
    });
    if (!user) {
      throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
    }

    if (!user.accounts || user.accounts.length < 1) {
      return null;
    }

    const promises = user.accounts.map(
      async (account) =>
        await this.memberRepository.findOne({
          where: { id: account.id },
          relations: ['company'],
        }),
    );
    const result = await Promise.all(promises);
    return await result;
  }

  async getProfileImage(imagename: string) {
    let avatarSrc: Readable;
    if (imagename) {
      avatarSrc = await this.s3Service.getFilesStream(`profiles/${imagename}`);
    }
    return avatarSrc;
  }

  private async sendEmail(
    invitorFullName: string,
    companiesNames: string[],
    token?: string,
    memberEmail?: string,
    avatarSrc?: string,
  ) {
    if (token) {
      this.emailService.sendInvitationNewMemberEmail({
        email: 'receipthub.sender@gmail.com',
        name: invitorFullName,
        companyNames: companiesNames,
        memberEmail,
        token,
        avatarSrc,
        host_url: this.configService.get('HOST_URL'),
      });
    }
    if (!token) {
      this.emailService.sendInvitationExistMemberEmail({
        email: 'receipthub.sender@gmail.com',
        name: invitorFullName,
        companyNames: companiesNames,
        avatarSrc,
        host_url: this.configService.get('HOST_URL'),
      });
    }
  }

  private async saveNotExistMember(
    companiesIds: string[],
    name: string,
    role: ECompanyRoles,
    invitation: MemberInvitesEntity,
  ): Promise<MemberEntity[]> {
    const members = await Promise.all(
      companiesIds.map((id) =>
        this.memberRepository.save({
          name: name,
          role: role,
          company: { id },
          memberInvite: invitation,
        }),
      ),
    );
    return members;
  }

  private async inviteExistMember(
    userInvitor: AuthEntity,
    existUser: AuthEntity,
    body: CreateCompanyAccountDTO,
    companiesNames: string[],
  ) {
    const { companiesIds, name, role } = body;
    const existUserAccounts = existUser.accounts.map((acc) =>
      this.memberRepository.findOne({
        where: { id: acc.id },
        relations: ['company'],
      }),
    );

    const existUserCompanies = await (
      await Promise.all(existUserAccounts)
    ).map((el) => el.company);

    const existedUserAccounts = existUserCompanies.filter((company) =>
      companiesIds.find((companyId) => company.id === companyId),
    );

    if (existedUserAccounts.length) {
      throw new HttpException(
        `USER ALREADY HAVE ACCOUNT FOR THIS COMPANY`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newMembers = await Promise.all(
      companiesIds.map((id) =>
        this.memberRepository.save({
          name: name || existUser.fullName,
          role: role,
          user: existUser,
          company: { id },
        }),
      ),
    );

    if (!existUser.active_account) {
      await this.authRepository.update(existUser.id, {
        active_account: userInvitor.active_account,
      });
    }

    await this.sendEmail(userInvitor.fullName, companiesNames);

    return await Promise.all(
      newMembers.map((acc) =>
        this.memberRepository.findOne({
          where: { id: acc.id },
          relations: ['company', 'memberInvite'],
        }),
      ),
    );
  }

  private async inviteNotExistMember(
    userInvitor: AuthEntity,
    body: CreateCompanyAccountDTO,
    companiesNames: string[],
  ): Promise<MemberEntity[]> {
    const { email, companiesIds, name, role } = body;
    const existedInvitation = await this.inviteNewMemberService.getInvitation({
      email,
    });

    if (existedInvitation) {
      const memberCompanies = await Promise.all(
        existedInvitation.members.map((member) =>
          this.companyRepository.findOne({
            where: { members: { id: member.id } },
          }),
        ),
      );

      const companiesIdsToInviteMember = companiesIds.filter(
        (id) => !memberCompanies.find((company) => company.id === id),
      );

      if (!companiesIdsToInviteMember.length) {
        throw new HttpException(
          `USER ALREADY HAVE ACCOUNT IN THIS COMPANIES`,
          HttpStatus.NOT_FOUND,
        );
      }

      const newMembers = await this.saveNotExistMember(
        companiesIdsToInviteMember,
        name,
        role,
        existedInvitation,
      );

      await this.sendEmail(
        userInvitor.fullName,
        companiesNames,
        existedInvitation.token,
        email,
      );

      return await Promise.all(
        newMembers.map((acc) =>
          this.memberRepository.findOne({
            where: { id: acc.id },
            relations: ['company', 'memberInvite'],
          }),
        ),
      );
    }

    if (!existedInvitation) {
      const token = await this.createToken({ email: email, id: uuid() });
      const invitationModel =
        await this.inviteNewMemberService.createInvitation(email, token);

      const newMembers = await this.saveNotExistMember(
        companiesIds,
        name,
        role,
        invitationModel,
      );

      await this.sendEmail(userInvitor.fullName, companiesNames, token, email);

      return await Promise.all(
        newMembers.map((acc) =>
          this.memberRepository.findOne({
            where: { id: acc.id },
            relations: ['company', 'memberInvite'],
          }),
        ),
      );
    }
  }

  async createCompanyMember(id: string, body: CreateCompanyAccountDTO) {
    const { companiesIds, email } = body;
    const { companies, accounts, userInvitor } = await this.extractDataFromUser(
      id,
    );

    const notUserInvitorCompaniesIds = companiesIds.filter(
      (companyId) => !companies.find((company) => company.id === companyId),
    );

    if (notUserInvitorCompaniesIds.length) {
      throw new HttpException(
        'USER DOES NOT HAVE ACCESS TO THE COMPANY',
        HttpStatus.FORBIDDEN,
      );
    }

    const inviteUserAccounts = accounts.filter((acc) =>
      companiesIds.find((id) => id === acc.company.id),
    );

    if (
      inviteUserAccounts.filter((acc) => acc.role === ECompanyRoles.user).length
    ) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR CREATE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const existUser = await this.authRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
      relations: ['accounts'],
    });

    const companiesNames = companies
      .filter((company) => companiesIds.find((id) => id === company.id))
      .map((item) => item.name);

    if (existUser) {
      const members = await this.inviteExistMember(
        userInvitor,
        existUser,
        body,
        companiesNames,
      );
      return members;
    }

    if (!existUser) {
      const invitations = await this.inviteNotExistMember(
        userInvitor,
        body,
        companiesNames,
      );
      return invitations;
    }
  }

  async deleteCompanyMember(id: string, accountId: string) {
    const company = await this.extractCompanyFromUser(id);
    const account = await this.extractUserAccount(id);

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR DELETE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const deletingUser = await this.memberRepository.findOne({
      where: {
        id: accountId,
        company: { id: company.id },
      },
      relations: ['company'],
    });

    if (deletingUser.role === ECompanyRoles.owner) {
      throw new HttpException(
        'CANT DELETE COMPANY OWNER',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.memberRepository.delete(deletingUser.id);
    return {
      message: 'The account has been deleted',
    };
  }

  async updateCompanyMember(
    id: string,
    accountId: string,
    body: UpdateCompanyAccountDTO,
  ) {
    const company = await this.extractCompanyFromUser(id);
    const account = await this.extractUserAccount(id);

    if (account.role === ECompanyRoles.user) {
      throw new HttpException(
        'USER HAS NO PERMISSION FOR UPDATE COMPANY MEMBERS',
        HttpStatus.FORBIDDEN,
      );
    }

    const updateUser = await this.memberRepository.findOne({
      where: { id: accountId },
      relations: ['company'],
    });

    if (
      account.id === updateUser.id ||
      !(updateUser.role === ECompanyRoles.owner)
    ) {
      await this.memberRepository.update(updateUser.id, { ...body });
      return await this.memberRepository.findOne({
        where: { id: updateUser.id },
      });
    }
    throw new HttpException(
      'YOU HAVE NO PERMISSION TO EDIT COMPANY OWNER',
      HttpStatus.FORBIDDEN,
    );
  }
}
