export const AUTH_SWAGGER = {
  sign_in: 'Sign-in user',
  sign_up: 'Sign-up user',
  sign_up_member: 'Sign-up-member',
  success: 'Success',
  log_out: 'LogOut',
};

export const AUTH_ROUTES = {
  main: 'auth',
  sign_up: 'sign-up',
  sign_up_member: 'sign-up-member',
  sign_in: 'sign-in',
  o_auth: 'o-auth',
  log_out: 'log-out',
  reset_password_request: 'reset-password-request',
  redirect_password: 'redirect-password/:token',
  redirect_member: 'redirect-member/:token',
  update_password: 'update-password',
  reset_password: 'reset-password',
};

export enum EOAuthTypes {
  apple = 'apple',
  capium = 'capium',
}

export const EMAIL_VALIDATION =
  /^\w+([\.+-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,})+$/;
export const PASSWORD_VALIDATION = /[\w+@$^!%._*#?&]{8,30}$/;
