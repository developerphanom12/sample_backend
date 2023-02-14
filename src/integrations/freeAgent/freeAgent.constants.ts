export const FREE_AGENT_ROUTES = {
  main: 'free_agent',
  authorize: 'authorize',
  exchange_tokens: 'exchangeTokens',
  disconnect: 'disconnect',
};

export const FREE_AGENT_SWAGGER = {
  main: 'Free Agent',
  callback: 'Callback',
  authorize: 'Authorize',
  exchange_tokens: 'Exchange Tokens',
  disconnect: 'Disconnect',
  success: 'Success',
};

export const free_agent_URLs = {
  auth: {
    sandbox: 'https://api.sandbox.freeagent.com/v2/approve_app',
    production: 'https://api.freeagent.com/v2/approve_app',
  },
  token: {
    sandbox: 'https://api.sandbox.freeagent.com/v2/token_endpoint',
    production: 'https://api.freeagent.com/v2/token_endpoint',
  },
  redirect_uri: `http://localhost:3001/callback`,
};
