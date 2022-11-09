export const RH_CONNECT_ROUTES = {
  main: 'integration',
  rh_connect: 'rh-connect',
  parse: 'parse-receipt',
};

export const RH_CONNECT_SWAGGER = {
  rh_connect: 'ReceiptHub-Connect',
  success: 'Success',
  parse: 'Parse-Receipt',
};

export const CORS_WHITE_LISTS = ['http://localhost:3001'];
export const CORS_ROUTE = `${RH_CONNECT_ROUTES.main}/${RH_CONNECT_ROUTES.parse}`
