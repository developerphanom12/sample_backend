export enum ECompanyRoles {
  owner = 'owner',
  admin = 'admin',
  user = 'user',
  accountant = 'accountant',
}

export const COMPANY_MEMBER_ROUTES = {
  main: 'company-member',
  create: 'create',
  update: 'update/:accountId',
  delete: 'delete/:accountId',
  get_accounts: 'get-all',
  select_active_account: 'select/:accountId',
  resend_invitation: 'resend-invitation/:invitationId',
};

export const COMPANY_MEMBER_SWAGGER = {
  create: 'Create Company Account',
  update: 'Update Company Account',
  delete: 'Delete Company Account',
  get_accounts: 'Get All User Accounts',
  select_active_account: 'Select Active Account',
  success: 'Success',
  resend_invitation: 'Resend Invitation',
};
