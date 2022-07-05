export enum ECompanyRoles {
  owner = 'owner',
  admin = 'admin',
  user = 'user',
}

export const COMPANY_MEMBER_ROUTES = {
  main: 'company-member',
  create: 'create',
  update: 'update/:accountId',
  delete: 'delete/:accountId',
  get_accounts: 'get-all',
  select_active_account: 'select/:accountId',
};

export const COMPANY_MEMBER_SWAGGER = {
  create: 'Create Company Account',
  update: 'Update Company Account',
  delete: 'Delete Company Account',
  get_accounts: 'Get All User Accounts',
  select_active_account: 'Select Active Account',
  success: 'Success',
};
