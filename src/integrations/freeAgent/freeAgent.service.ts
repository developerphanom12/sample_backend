import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';

import { FreeAgentConfigService } from './config';
import { IOAuthResponse, ISendRequest } from './types/freeAgent.types';

@Injectable()
export class FreeAgentService {
  constructor(
    private httpService: HttpService,
    private freeAgentConfigService: FreeAgentConfigService,
  ) {}
  public async authorizeUser(): Promise<string> {
    // active account as a param
    // find company with relations => integration
    // if integration has field => isIntegrated ? throw an error
    // if not do the logic
    try {
      const params = this.createParams(
        this.freeAgentConfigService.get_auth_token_params(),
      );
      // const params = this.createParams(free_agent_config.auth_token_params);
      // const authURI = `${free_agent_config.auth_url}?${params}`;
      const authURI = `${this.freeAgentConfigService.authUrl}?${params}`;
      return authURI;
    } catch (err) {
      console.log(err);
      throw new HttpException('AUTH ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  public async exchangeTokens(code: string): Promise<IOAuthResponse> {
    if (!code) {
      throw new HttpException('CODE IS REQUIRED', HttpStatus.BAD_REQUEST);
    }
    const params = this.createParams(
      this.freeAgentConfigService.get_access_token_params(),
    );

    try {
      const response: IOAuthResponse = await this.sendRequest({
        url: this.freeAgentConfigService.tokenUrl,
        requestParams: params,
        body: {
          grant_type: 'authorization_code',
          code,
        },
      });
      console.log(response, 'tokens');
      await this.refreshAccessToken(response.refresh_token);
      return response;
    } catch (err) {
      console.log(err);
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
      const params = this.createParams(
        this.freeAgentConfigService.get_refresh_token_params(),
      );

      const response: IOAuthResponse = await this.sendRequest({
        url: this.freeAgentConfigService.tokenUrl,
        requestParams: params,
        body: {
          grant_type: 'refresh_token',
          refresh_token,
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      console.error(error.intuit_tid);
      throw new HttpException('REFRESH TOKENS ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  private async sendRequest(params: ISendRequest) {
    const { body, requestParams, url } = params;
    const request = this.httpService
      .post(`${url}?${requestParams}`, body)
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );
    return await lastValueFrom(request);
  }

  private createParams(data: Record<string, string>) {
    const params = new URLSearchParams(data).toString();
    return params;
  }
}
