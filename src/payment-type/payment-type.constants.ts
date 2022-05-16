export const PAYMENT_TYPE_ROUTES = {
    main: 'payment-type',
    create: 'create',
    update: 'update',
    get: 'get/:paymentTypeId',
    get_all: 'get-all',
    get_many: 'get-many',
    delete: 'delete/:paymentTypeId',
  };
  
export const PAYMENT_TYPE_SWAGGER = {
  success: "Success",
  create: "Create payment type",
  update: "Update payment type",
  get: "Get payment type details",
  get_all: "Get all payment types",
  get_many: "Get payment types with pagination",
  delete: "Delete payment type",
}