import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ses from 'node-ses';
import { EMAIL_CONFIG } from 'src/constants/email';
import { createPasswordMailSes } from 'src/shared/emails/create-password-email';
import { createReceiptFileEmail } from 'src/shared/emails/receipt-file-email';
import { inviteExistMemberMailSes } from '../shared/emails/invite-exist-member-email';
import { inviteNewMemberMailSes } from '../shared/emails/invite-new-member-email';
import { IInviteMember } from '../shared/emails/types/emails.types';

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

  public async sendResetPasswordEmail(body: IResetPasswordMessage) {
    const payload = createPasswordMailSes(body);

    this.sesClient.sendEmail(payload, (error) => {
      console.error(error);
    });

    return {
      message: 'Email sent',
    };
  }

  public async sendInvitationExistMemberEmail(body: IInviteMember) {
    const payload = inviteExistMemberMailSes(body);

    this.sesClient.sendEmail(payload, (error) => {
      console.error(error);
    });

    return {
      message: 'Email sent',
    };
  }

  public async sendInvitationNewMemberEmail(body: IInviteMember) {
    const payload = inviteNewMemberMailSes(body);

    this.sesClient.sendEmail(payload, (error) => {
      console.error(error);
    });

    return {
      message: 'Email sent',
    };
  }
}
