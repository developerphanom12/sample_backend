import { EMAIL_CONFIG } from '../../constants/email';

import { IInviteCompanyOwner } from './types/emails.types';

export const inviteCompanyOwnerMailSes = (data: IInviteCompanyOwner) => {
  const { email, host_url, name, token, avatarSrc } = data;
  const srcAv = `data:image/png;base64,${avatarSrc}`;
  return {
    from: `${EMAIL_CONFIG.companyName} <${EMAIL_CONFIG.email}>`,
    to: email,
    subject: 'ReceiptHub company invitation',
    message: `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="format-detection" content="telephone=no">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300&display=swap" rel="stylesheet">
        <style>
          img {
            border: none;
            -ms-interpolation-mode: bicubic;
            max-width: 100%;
          }

          body {
            background-color: #f6f6f6;
             -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }

          table {
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
          }
            table td {
              font-size: 14px;
              vertical-align: top;
            }

          p,ul,ol {
            font-size: 14px;
            font-weight: normal;
            margin: 0;
            Margin-bottom: 15px;
          }

            p li,
            ul li,
            ol li {
              list-style-position: inside;
              margin-left: 5px;
            }

          .paragraph {
            margin: 0;
          }

          @media only screen and (max-width: 700px) {
            table[class=body] .wrapper {
              padding: 10px !important;
            }
            table[class=body] .container {
              width: 100% !important;
            }
            table[class=body] .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            table[class=body] .mobile_paragraph {
              width: 90% !important;
            }
          }

          @media only screen and (max-width: 500px) {
            table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
              font-size: 13px !important;
            }
            table[class=body] .content_wrapper {
              padding: 15px !important;
            }
            table[class=body] .button_mobile {
              padding: 8px 0 !important;
            }
            table[class=body] .mobile_paragraph {
              padding-bottom: 10px !important
            }
          }
         </style>
      </head>
      <body>
        <table border="0" cellpadding="0" cellspacing="0" class="body" style="width:100%">
          <tr>
          <td>&nbsp;</td>
            <td class="container" style="display:block;margin:0 auto !important;max-width:600px;padding:10px;width:600px">
              <div class="content" style="box-sizing:border-box;display:block;margin:0 auto;max-width:600px;padding:10px;background:#F7F8FB">
                <table class="main" style="width:100%">
                  <tr>
                    <td class="wrapper" style="box-sizing:border-box;padding:20px">
                      <table border="0" style="width:100%;background-color:#FF5252;padding:18px 45px" class="content_wrapper">
                        <tr>
                          <td style="text-align:center;width:100%" align="center">
                            <p style="font-family:'Open Sans', sans-serif;font-size:16px;color:white;margin:0;line-height:22px;font-weight:600"><img src='https://i.postimg.cc/Hx2kBbG3/logo.png' alt='logo' style="margin-right:5px;vertical-align:middle" />ReceiptHub</p>
                          </td>
                        </tr>
                      </table>
                    <table border="0" cellpadding="0" cellspacing="0" class="content_wrapper" style="background:#E5E5E5;padding:25px 0">
                          <tr>
                            <td>
                              <p style="font-family:'Open Sans', sans-serif;font-size:16px;font-weight:600;line-height:22px;margin-bottom:43px;text-align:center;color:#000000;" class="mobile_paragraph">
                                You are invited to join a company on 
                                <a href="http://18.133.68.78/" target="_blank" style="color: #0092DB; text-decoration: underline;" >Receipthub.co.uk</a> 
                              </p>
                              <p style="font-family:'Open Sans', sans-serif;font-size:16px;font-weight:400;line-height:22px;margin-bottom:35px;text-align:center;" class="mobile_paragraph">
                              ${
                                avatarSrc
                                  ? `<img src="${srcAv}" style="width:32px;height:32px;vertical-align:middle;border-radius:50%;" />`
                                  : ''
                              }
                                <span style="font-size:16px;font-weight:600;color:#000000">${name}</span> invited you to create your company <span style="font-size:16px;font-weight:600;color:#000000">
                              </p>
                              <p style="padding-bottom:0px;" class="mobile_paragraph">
                                <a class="button_mobile" href=${host_url}auth/redirect-member/${token} style="font-family:'Open Sans', sans-serif;display:block;background-color:#FF5252;border-radius:5px;padding:12px 0;color:#F2F2F2;font-weight:400;text-decoration:none;margin:0 auto;text-align:center;max-width:180px;width:100%;">
                                  Create company
                                </a>
                              </p>
                              <p style="font-family:'Open Sans', sans-serif;font-size:16px;line-height:30px;margin:0;padding-bottom:5px;padding-top:15px;text-align:center;" class="mobile_paragraph">
                                Your login email:
                              </p>
                              <p style="font-family:'Open Sans', sans-serif;font-size:16px;line-height:30px;margin:0;padding-bottom:5px;padding-top:15px;text-align:center;" class="mobile_paragraph">
                                If you don't want to create company, just ignore this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            <td>&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>`,
  };
};
