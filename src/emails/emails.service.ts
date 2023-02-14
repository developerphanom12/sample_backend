import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ses from 'node-ses';
import { EMAIL_CONFIG } from 'src/constants/email';
import { createPasswordMailSes } from 'src/shared/emails/create-password-email';
import { createReceiptFileEmail } from 'src/shared/emails/receipt-file-email';
import { inviteCompanyOwnerMailSes } from '../shared/emails/invite-company-owner-email';
import { inviteExistMemberMailSes } from '../shared/emails/invite-exist-member-email';
import { inviteNewMemberMailSes } from '../shared/emails/invite-new-member-email';
import { bindSocialAccMailSes } from '../shared/emails/bind-social-account-email';
import {
  IInviteCompanyOwner,
  IInviteMember,
} from '../shared/emails/types/emails.types';

export interface IRawMessageBody {
  name: string;
  email: string;
  subject: string;
  attachedFile: string;
  messageBody: string;
}

export interface IResetPasswordMessage {
  email: string;
  token: string;
  name: string;
  host_url: string;
}
export interface ICompanyInvitationMessage {
  email: string;
  token: string;
  name: string;
  host_url: string;
}

@Injectable()
export class EmailsService {
  constructor(private configService: ConfigService) {}

  private readonly sesClient = ses.createClient({
    key: this.configService.get('AWS_SES_ACCESS_KEY_ID'),
    secret: this.configService.get('AWS_SES_SECRET_ACCESS_KEY'),
    amazon: 'https://email.eu-west-2.amazonaws.com',
  });

  public async sendEmailXLSX(body: IRawMessageBody) {
    const payload = createReceiptFileEmail(body);

    this.sesClient.sendRawEmail(
      {
        from: EMAIL_CONFIG.email,
        rawMessage: payload,
      },
      (error) => {
        console.error(error);
      },
    );

    return {
      message: 'Email sent',
    };
  }

  private async sendEmail(payload: {
    from: string;
    to: string;
    subject: string;
    message: string;
  }) {
    this.sesClient.sendEmail(payload, (error) => {
      console.error(error);
    });

    return {
      message: 'Email sent',
    };
  }
  public async sendResetPasswordEmail(body: IResetPasswordMessage) {
    const payload = createPasswordMailSes(body);

    this.sesClient.sendEmail(payload, (error) => {
      console.error(error);
    });

    return {
      message: 'Email sent',
    };
  }

  public async sendLinkSocialAccToUser(body: IResetPasswordMessage) {
    const payload = bindSocialAccMailSes(body);
    return await this.sendEmail(payload);
  }

  public async sendInvitationCreateCompany(body: IInviteCompanyOwner) {
    const payload = inviteCompanyOwnerMailSes(body);
    return await this.sendEmail(payload);
  }

  public async sendInvitationExistMemberEmail(body: IInviteMember) {
    const payload = inviteExistMemberMailSes(body);
    return await this.sendEmail(payload);
  }

  public async sendInvitationNewMemberEmail(body: IInviteMember) {
    const payload = inviteNewMemberMailSes(body);
    return await this.sendEmail(payload);
  }
}
