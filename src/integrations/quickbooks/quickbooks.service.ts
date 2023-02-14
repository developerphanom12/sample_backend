import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuthClient from 'intuit-oauth';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class QuickbooksService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  private readonly oauthClient = new OAuthClient({
    clientId: 'ABxFVUZqHHWpmSCdjFzMl9cms0YLx4XWMSWmDifkiOgunzAhSS',
    clientSecret: 'fcoXIPcTbLuslV5iuCzTnXMncoj3ZjRlpw8WN9eX',
    environment: 'sandbox',
    redirectUri: 'http://localhost:3001/callback',
    logging: true,
  });

  public async authorizeUser() {
    // active account as a param
    // find company with relations => integration
    // if integration has field => isIntegrated ? throw an error
    // if not do the logic
    try {
      const authUri = this.oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting],
        state: 'quick_books',
      });

      return authUri;
    } catch (err) {
      console.log(err);
      throw new HttpException('AUTH ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  public async exchangeTokens(url: string) {
    try {
      if (!url) {
        throw new HttpException('URL IS REQUIRED', HttpStatus.BAD_REQUEST);
      }
      const authResponse = await this.oauthClient.createToken(url);
      const tokens = authResponse.getJson();
      return tokens;
    } catch (error) {
      console.error(error);
      console.error('The error message is :' + error.originalMessage);
      console.error(error.intuit_tid);
      throw new HttpException('EXCHANGE TOKEN ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  public async refreshAccessToken(refresh_token: string) {
    try {
      if (!refresh_token) {
        throw new HttpException(
          'REFRESH TOKEN IS REQUIRED',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newTokens = await this.oauthClient
        .refreshUsingToken(refresh_token)
        .getJson();

      return newTokens;
    } catch (error) {
      console.error(error);
      console.error(error.intuit_tid);
      throw new HttpException('REFRESH TOKENS ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  public async revokeToken() {
    try {
      //get the token from the DB
      // delete the token from the DB, and maybe from the oauthClient
      const authToken = this.oauthClient.token.getToken();

      if (!authToken) {
        throw new HttpException('TOKEN IS EMPTY', HttpStatus.BAD_REQUEST);
      }
      await this.oauthClient.revoke();

      return {
        message: 'THE COMPANY WAS SUCCESSFULLY DISCONECTED',
      };
    } catch (error) {
      console.error(error);
      console.error(error.intuit_tid);
      throw new HttpException('REVOKE TOKENS ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  public async getAllInvoices() {
    const realmId = 4620816365268578650;
    const accessToken =
      'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..ZuZ1yO-BR6sBqDdGPghi3A.SD4TZyZP3NjbRYuBN69KuSn0VDf0GDGQqaKshE9DSrt_LgQ6pVrvBHtbP-TodDJeK4FseGVR8UBcctiSNajhpwSSimvrxcH86VSHnRh_fql_50GAAyJzfqirlvAUgrMmetvXD08cLlIDkjOEktrhOs2t4V5QpIVD0DQTgdw1MNkAOEiop3a3zArJUmkPpoIScAWzXffEGzUKbEBho3jM9FUU7OjVufBIFoUuglr90NyqW9kkw-eT2_0wYvPYYNxBXtnkuGdjMf9alBj2ntc0RYAMt6zTo7zswEhc5xJrPGNHaNBAcfDaTngpmrdW7g6bHht7j8fMSvVBZYHiMb5gfzvktmoRZNsa7qLx0ZJHdH6NNH7gw_SNAcSkmanP9XULI0ZkGW5q8_0dFtCfdDGaY-Ys-qYqeQ3MhyZR2880mepCTXmXtbqgKKo0HruW2f1SD4qQ2lb9AGEZ68I0pEl0n-1bnkzUwRMA4gfVmYz_atJ2dP6YrVCDZ6NgDGbSwZgNB519kPYoYnwKRRbRXSiCS7kmkTyMX8Ul-W3KLcXk94HKZ4BJ7D6wx6_PzMfQrkpGHupjTBLFx5C-Zwrk9BsFKLtRvPW1I2ji4WhgBJpuJ9ycYp2uQv42qfp1Cu4binL42vhoX0JUwjJqJzTHwySns9DS7wl26LnHC6aevccHR76xgxTqnK_FN9Dkiz8zQRTr34HtO9Xm_zySo4gDGxw0_aIx8yCIT_JzQPr35_BRqIALiOi0eF2GolfdjBYNn3D4.m4HlbReK6WJpE3AI4oOqMg';
    const URL = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=select * from Invoice&minorversion=${65}}`;
    const headers = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const request = this.httpService
        .get(`${URL}`, {
          headers: headers.headers,
        })
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            console.log(err, 'err');

            throw new ForbiddenException('API not available');
          }),
        );
      const resp = await lastValueFrom(request);
      console.log(resp, 'resp');
      return resp;
    } catch (error) {
      console.log(error, 'adadadadadada');
    }
  }
  public async createInvoice() {
    const realmId = 4620816365268578650;
    const accessToken =
      'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..ZuZ1yO-BR6sBqDdGPghi3A.SD4TZyZP3NjbRYuBN69KuSn0VDf0GDGQqaKshE9DSrt_LgQ6pVrvBHtbP-TodDJeK4FseGVR8UBcctiSNajhpwSSimvrxcH86VSHnRh_fql_50GAAyJzfqirlvAUgrMmetvXD08cLlIDkjOEktrhOs2t4V5QpIVD0DQTgdw1MNkAOEiop3a3zArJUmkPpoIScAWzXffEGzUKbEBho3jM9FUU7OjVufBIFoUuglr90NyqW9kkw-eT2_0wYvPYYNxBXtnkuGdjMf9alBj2ntc0RYAMt6zTo7zswEhc5xJrPGNHaNBAcfDaTngpmrdW7g6bHht7j8fMSvVBZYHiMb5gfzvktmoRZNsa7qLx0ZJHdH6NNH7gw_SNAcSkmanP9XULI0ZkGW5q8_0dFtCfdDGaY-Ys-qYqeQ3MhyZR2880mepCTXmXtbqgKKo0HruW2f1SD4qQ2lb9AGEZ68I0pEl0n-1bnkzUwRMA4gfVmYz_atJ2dP6YrVCDZ6NgDGbSwZgNB519kPYoYnwKRRbRXSiCS7kmkTyMX8Ul-W3KLcXk94HKZ4BJ7D6wx6_PzMfQrkpGHupjTBLFx5C-Zwrk9BsFKLtRvPW1I2ji4WhgBJpuJ9ycYp2uQv42qfp1Cu4binL42vhoX0JUwjJqJzTHwySns9DS7wl26LnHC6aevccHR76xgxTqnK_FN9Dkiz8zQRTr34HtO9Xm_zySo4gDGxw0_aIx8yCIT_JzQPr35_BRqIALiOi0eF2GolfdjBYNn3D4.m4HlbReK6WJpE3AI4oOqMg';
    const URL = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/invoice?minorversion=${65}}`;
    const headers = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const body = {
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          Amount: 100.0,
          SalesItemLineDetail: {
            ItemRef: {
              name: 'Services',
              value: '1',
            },
          },
        },
      ],
      CustomerRef: {
        value: '1',
      },
    };
    try {
      const request = this.httpService
        .post(`${URL}`, body, {
          headers: headers.headers,
        })
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            console.log(err, 'err');

            throw new ForbiddenException('API not available');
          }),
        );
      const resp = await lastValueFrom(request);
      return resp;
    } catch (error) {
      console.log(error);
    }
  }
}
