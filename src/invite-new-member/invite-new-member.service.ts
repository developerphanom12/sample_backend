import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { PaginationDTO } from '../receipt/dto/receipt-pagination.dto';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';

@Injectable()
export class InviteNewMemberService {
  constructor(
    @InjectRepository(MemberInvitesEntity)
    private memberInvitesRepository: Repository<MemberInvitesEntity>,
  ) {}

  public async getAllCompaniesInvites(
    accountsWithInvites: string[],
    body: PaginationDTO,
  ) {
    const [result, total] = await this.memberInvitesRepository.findAndCount({
      where: {
        email: Like(`%${body.search || ''}%`),
        members: { id: In(accountsWithInvites) },
        isCompanyInvite: true,
      },
      relations: ['members'],
      order: { created: 'DESC' },
      take: body.take ?? 10,
      skip: body.skip ?? 0,
    });
    return {
      data: result,
      count: total,
    };
  }

  public async getInvitation(body: {
    email?: string;
    invitationId?: string;
    memberId?: string;
  }): Promise<MemberInvitesEntity> {
    const { email, invitationId, memberId } = body;
    let existedInvitation = null;

    if (email) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { email: email },
        relations: ['members'],
      });
    }
    if (memberId) {
      existedInvitation = await this.memberInvitesRepository.findOne({
        where: { members: { id: memberId } },
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
    isCompanyInvite?: boolean,
  ): Promise<MemberInvitesEntity> {
    const invitation = await this.memberInvitesRepository.save({
      email: email,
      userInvitorId: userInvitorId,
      isCompanyInvite: isCompanyInvite,
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
