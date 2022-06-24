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
}

export const COMPANY_MEMBER_SWAGGER = {
  create: 'Create Company Account',
  update: "Update Company Account",
  delete: "Delete Company Account",
  success: "Success",
}