import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  COMPANY_MEMBER_ERRORS,
  ECompanyRoles,
} from 'src/company-member/company-member.constants';
import { COMPANY_ERRORS } from 'src/company/company.errors';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';
import { MemberEntity } from '../company-member/entities/company-member.entity';

@Injectable()
export class InviteNewMemberService {
  constructor(
    @InjectRepository(MemberInvitesEntity)
    private memberInvitesRepository: Repository<MemberInvitesEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private companyService: CompanyService,
  ) {}

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

  public async deleteInvitation(
    id: string,
    isDeleteCompany?: boolean,
  ): Promise<{ message: string }> {
    const invite = await this.memberInvitesRepository.findOne({
      where: { id: id },
      relations: ['members'],
    });

    if (!invite) {
      throw new HttpException(
        COMPANY_MEMBER_ERRORS.invite_not_found,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check is delete only in invite table
    if (!isDeleteCompany) {
      await this.memberInvitesRepository.delete(invite.id);
      return {
        message: 'The invitation has been deleted',
      };
    }

    // Check is invite type of the owner invitation
    if (!invite.isCompanyInvite) {
      throw new HttpException(
        COMPANY_MEMBER_ERRORS.cant_delete_with_company,
        HttpStatus.BAD_REQUEST,
      );
    }

    const companyOwnerAcc = invite.members.find(
      (el) => el.role === ECompanyRoles.owner,
    );

    //find memberAcc with company
    const companyOwnerAccWithCompany = await this.memberRepository.findOne({
      where: {
        id: companyOwnerAcc.id,
      },
      relations: ['company'],
    });

    // Extract company from members
    const company = await this.companyRepository.findOne({
      where: { id: companyOwnerAccWithCompany.company.id },
    });

    if (!company) {
      throw new HttpException(COMPANY_ERRORS.company, HttpStatus.BAD_REQUEST);
    }

    // Delete company with all members
    await this.companyService.companyDelete(invite.userInvitorId, company.id);

    // Delete invite
    await this.memberInvitesRepository.delete(invite.id);
    return {
      message: 'The invitation has been deleted',
    };
  }

  public async updateInvitation(
    id: string,
    body: { email?: string; isActive?: boolean },
  ): Promise<MemberInvitesEntity> {
    await this.memberInvitesRepository.update(id, { ...body });
    return await this.memberInvitesRepository.findOne({
      where: { id: id },
    });
  }
}
