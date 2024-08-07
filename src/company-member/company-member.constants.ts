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
  update_create_company_invite: 'update-create-company-invite/:inviteId',
  delete_create_company_invite: 'delete-create-company-invite/:inviteId',
  delete: 'delete/:accountId',
  deleteOwn: 'delete-own/:accountId',
  get_accounts: 'get-all',
  select_active_account: 'select/:accountId',
  resend_invitation: 'resend-invitation/:invitationId',
};

export const COMPANY_MEMBER_SWAGGER = {
  create: 'Create Company Account',
  update: 'Update Company Account',
  update_create_company_invite: 'Update Create Company Invite',
  delete_create_company_invite: 'Delete Create Company Invite',
  delete: 'Delete Company Account',
  get_accounts: 'Get All User Accounts',
  select_active_account: 'Select Active Account',
  success: 'Success',
  resend_invitation: 'Resend Invitation',
};

export const COMPANY_MEMBER_ERRORS = {
  invite_not_found: 'Invite not found',
  cant_delete_with_company: 'This invite can`t be deleted with company',
  different_invitor: 'Invitor should be the same for resending',
};
