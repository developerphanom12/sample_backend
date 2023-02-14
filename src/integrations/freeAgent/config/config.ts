import { Injectable } from '@nestjs/common';

@Injectable()
export class FreeAgentConfigService {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly authUrl: string;
  readonly tokenUrl: string;

  constructor() {
    this.clientId = 'pI3VgoEL7fyUM9i9_6-U4w';
    this.clientSecret = 'WEQWVahD8tA5w719jijK5A';
    this.redirectUri = 'http://localhost:3001/callback';
    this.tokenUrl = 'https://api.sandbox.freeagent.com/v2/token_endpoint';
    this.authUrl = 'https://api.sandbox.freeagent.com/v2/approve_app';
    // this.clientId = process.env.FREEAGENT_CLIENT_ID;
    // this.clientSecret = process.env.FREEAGENT_CLIENT_SECRET;
    // this.redirectUri = process.env.FREEAGENT_REDIRECT_URI;
  }

  get_auth_token_params() {
    return {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
    };
  }

  get_access_token_params() {
    return {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      client_secret: this.clientSecret,
    };
  }

  get_refresh_token_params() {
    return {
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
  }
}

// import { free_agent_URLs } from '../freeAgent.constants';

// const isStaging = process.env.NODE_ENV === 'staging';

// const auth_url = free_agent_URLs.auth[isStaging ? 'production' : 'sandbox'];
// const token_url = free_agent_URLs.token[isStaging ? 'production' : 'sandbox'];

// const basic_query_params = {
//   client_id: 'pI3VgoEL7fyUM9i9_6-U4w',
//   redirect_uri: free_agent_URLs.redirect_uri,
// };

// const auth_token_params = {
//   ...basic_query_params,
//   response_type: 'code',
// };
// const access_token_params = {
//   ...basic_query_params,
//   client_secret: 'WEQWVahD8tA5w719jijK5A',
// };

// const refresh_token_params = {
//   client_secret: access_token_params.client_secret,
//   client_id: basic_query_params.client_id,
// };

// export const free_agent_config = {
//   auth_url,
//   token_url,
//   auth_token_params,
//   access_token_params,
//   refresh_token_params,
// };
