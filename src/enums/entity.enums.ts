export enum OrderStatusEnum {
  PROCESSING = 'processing',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
}

export enum OrderPaymentStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum UserRoleEnum {
  CUSTOMER = 'customer',
  SALES_MANAGER = 'sales_manager',
  PRODUCT_MANAGER = 'product_manager',
}

export enum PerfumeTypeEnum {
  EDP = 'edp',
  EDT = 'edt',
  PARFUM = 'parfum',
}
