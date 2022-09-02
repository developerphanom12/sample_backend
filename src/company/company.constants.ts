export const COMPANY_ROUTES = {
  main: 'company',
  create: 'create',
  update: 'update/:company',
  get: 'get/:company',
  get_logo: 'get-logo/:company',
  change_logo: 'change-logo',
  get_all: 'get-all',
  get_many: 'get-many',
  get_members: 'get-members',
  get_invitation: 'get-invitation',
  delete: 'delete/:id',
  delete_logo: 'delete-logo/:company',
};

export const COMPANY_SWAGGER = {
  create: 'Create company',
  update: 'Update Company',
  get: 'Get one company',
  get_logo: 'Get Company Logo',
  change_logo: 'Change Company Logo',
  get_all: 'Get all companies',
  get_many: 'Get all companies via search and pagination',
  get_invitation: 'Get all invitation to create company',
  get_members: 'Get company members',
  delete: 'Delete company',
  delete_logo: 'Delete company logo',
  success: 'Success',
};
