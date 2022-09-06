import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { PaginationDTO } from '../receipt/dto/receipt-pagination.dto';
import { COMPANY_MEMBER_ERRORS } from 'src/company-member/company-member.constants';
import { COMPANY_ERRORS } from 'src/company/company.errors';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';

import { MemberInvitesEntity } from './entities/company-member-invites.entity';

@Injectable()
export class InviteNewMemberService {
  constructor(
    @InjectRepository(MemberInvitesEntity)
    private memberInvitesRepository: Repository<MemberInvitesEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    private companyService: CompanyService,
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

    // Extract company from members
    const company = await this.companyRepository.findOne({
      where: { id: invite.members[0].company.id },
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
    body: { token?: string; email?: string },
  ): Promise<MemberInvitesEntity> {
    await this.memberInvitesRepository.update(id, { ...body });
    return await this.memberInvitesRepository.findOne({
      where: { id: id },
    });
  }
}
