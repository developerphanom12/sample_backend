import { EMAIL_CONFIG } from 'src/constants/email';
import { IRawMessageBody } from 'src/emails/emails.service';

export const createReceiptFileEmail = (body: IRawMessageBody) => {
  return [
    `From: "${EMAIL_CONFIG.companyName}" <${EMAIL_CONFIG.email}>`,
    `To: "${body.name || 'user'}" <${body.email}>`,
    `Subject: ${body.subject || 'Receipts Export'}`,
    'Content-Type: multipart/mixed;',
    '    boundary="_003_97DCB304C5294779BEBCFC8357FCC4D2"',
    'MIME-Version: 1.0',
    '',
    '--_003_97DCB304C5294779BEBCFC8357FCC4D2',
    'Content-Type: text/html; charset="iso-8859-1"',
    'Content-Transfer-Encoding: quoted-printable',
    `<html>
    <head></head>
    <body>
    <p>${
      body.messageBody ||
      `Hello ${
        body.name || 'User'
      }, Attached the receipts file for your reference. Thanks`
    }</p>
    <p>This email was sent via Receipt Hub</p>
    </body>
    </html>`,
    '',
    '--_003_97DCB304C5294779BEBCFC8357FCC4D2',
    'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="receipts.xlsx"',
    'Content-Description: receipts.xlsx',
    'Content-Disposition: attachment; filename="receipts.xlsx";',
    'Content-Transfer-Encoding: base64',
    '',
    `${body.attachedFile}`,
    '',
    '--_003_97DCB304C5294779BEBCFC8357FCC4D2',
    '',
  ].join('\r\n');
};
