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
    invitationId?: string;
  }): Promise<MemberInvitesEntity> {
    const { email, token, invitationId } = body;
    let existedInvitation = null;

    if (email) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { email: email },
        relations: ['members'],
      });
    }
    if (invitationId) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { id: invitationId },
        relations: ['members'],
      });
    }

    return existedInvitation;
  }

  public async createInvitation(
    email: string,
    userInvitorId?: string,
  ): Promise<MemberInvitesEntity> {
    const invitation = await this.memberInvitesRepository.save({
      email: email,
      userInvitorId: userInvitorId,
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

  public async updateInvitation(
    id: string,
    body: { token?: string; email?: string },
  ): Promise<MemberInvitesEntity> {
    await this.memberInvitesRepository.update(id, { ...body });
    return await this.memberInvitesRepository.findOne({
      where: { id: id },
    });
  }
}
