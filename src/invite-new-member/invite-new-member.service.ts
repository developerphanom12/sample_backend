import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';

@Injectable()
export class InviteNewMemberService {
  constructor(
    @InjectRepository(MemberInvitesEntity)
    private memberInvitesRepository: Repository<MemberInvitesEntity>,
  ) {}

  public async getInvitation(body: {
    token?: string;
    email?: string;
  }): Promise<MemberInvitesEntity> {
    const { email, token } = body;
    let existedInvitation = null;

    if (token) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { token: token },
        relations: ['members'],
      });
    }

    if (email) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { email: email },
        relations: ['members'],
      });
    }

    return existedInvitation;
  }

  public async createInvitation(
    email: string,
    token: string,
  ): Promise<MemberInvitesEntity> {
    const invitation = await this.memberInvitesRepository.save({
      email: email,
      token: token,
    });

    return invitation;
  }

  public async deleteInvitation(id: string): Promise<{ message: string }> {
    if (!id) {
      throw new HttpException(
        'Id should be exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    await this.memberInvitesRepository.delete(id);

    return {
      message: 'The invitation has been deleted',
    };
  }
}
