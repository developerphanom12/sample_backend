export const AUTH_SWAGGER = {
  sign_in: 'Sign-in user',
  sign_up: 'Sign-up user',
  success: 'Success',
  log_out: 'LogOut',
};

export const AUTH_ROUTES = {
  main: 'auth',
  sign_up: 'sign-up',
  sign_in: 'sign-in',
  o_auth: 'o-auth',
  log_out: 'log-out'
};

export enum EOAuthTypes {
  apple = 'apple',
  capium = 'capium',
}

export const EMAIL_VALIDATION = /^\w+([\.+-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,})+$/