import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

// import OAuthClient from 'intuit-oauth';
const OAuthClient = require('intuit-oauth');

@Injectable()
export class QuickbooksService {
  constructor(private configService: ConfigService) {}

  private readonly oauthClient = new OAuthClient({
    clientId: 'ABxFVUZqHHWpmSCdjFzMl9cms0YLx4XWMSWmDifkiOgunzAhSS',
    clientSecret: 'fcoXIPcTbLuslV5iuCzTnXMncoj3ZjRlpw8WN9eX',
    environment: 'sandbox',
    redirectUri: 'http://localhost:3001/callback',
    logging: true,
  });

  public async authorizeUser(res: Response) {
    const authUri = this.oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: 'testState',
    });
    try {
      res.send(authUri);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  public async exchangeTokens(url: string) {
    try {
      const data = await this.oauthClient.createToken(url);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
}
