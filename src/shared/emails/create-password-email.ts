import { EMAIL_CONFIG } from 'src/constants/email';

export const createPasswordMailSes = ({
  email,
  token,
  name,
  host_url,
}: {
  email: string;
  token: string;
  name: string;
  host_url: string;
}) => {
  return {
    from: `${EMAIL_CONFIG.companyName} <${EMAIL_CONFIG.email}>`,
    to: email,
    subject: 'ReceiptHub password reset',
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
              padding: 13px 30px !important;
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
                        <table border="0" style="width:100%;background-color:#FF5252;padding:15px 45px" class="content_wrapper">
                          <tr>
                            <td style="text-align:left;width:100%" align="left">
<p style="font-family:Helvetica, Verdana, Arial, sans-serif;font-size:24px;color:white;margin:0;line-height:30px;font-weight:bold">ReceiptHub</p>
                            </td>
                          </tr>
                        </table>
                        <table border="0" cellpadding="0" cellspacing="0" class="content_wrapper" style="background:#ffffff;padding:35px 45px">
                          <tr>
                            <td>
                              <p style="font-family:Helvetica, Verdana, Arial, sans-serif;font-size:22px;font-weight:bold;line-height:30px;padding-bottom:15px;margin:0" class="mobile_paragraph">
                                Forgot your password, ${name}?
                              </p>
                              <p style="font-family:Helvetica, Verdana, Arial, sans-serif;font-size:16px;line-height:30px;padding-bottom:15px;margin:0" class="mobile_paragraph">
                                Not a problem, you can easily reset it here:
                              </p>
                              <p style="padding-bottom:15px" class="mobile_paragraph">
                                    <a class="button_mobile" href=${host_url}auth/redirect-password/${token} style="font-family:Helvetica, Verdana, Arial, sans-serif;display:block;background-color:#FF5252;border-radius:5px;padding:15px 60px;color:#ffffff;font-weight:bold;text-decoration:none;margin: 0;width:max-content">
                                      Reset Password
                                    </a>
                              </p>
                              <p style="font-family:Helvetica, Verdana, Arial, sans-serif;font-size:16px;line-height30px;margin:0;padding-bottom:5px;padding-top:15px;" class="mobile_paragraph">
                                If you don't need to reset your password, just ignore this email.
                              </p>
                              <p style="font-family:Helvetica, Verdana, Arial, sans-serif;font-size:16px;line-height30px;padding-bottom:30px;" class="mobile_paragraph">
                                Didn't request a password reset? Contact <a style="color:#FF5252;text-decoration:none;" href="http://receipthub.com/contact/">ReciepHub support</a> so we can make sure no one else is tying to access your ID.
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
