export enum PaymentType {
  FULL = 'full',
  PARTIAL = 'partial',
  CREDIT = 'credit'
}

export enum PayableStatus {
  SETTLED = 'settled',
  UNSETTLED = 'unsettled'
}

export enum ReferenceType {
  SALE = 'SALE',
  PURCHASE_PAYMENT = 'PURCHASE_PAYMENT',
  EXPENSE = 'EXPENSE',
  CUSTOMER_PAYMENT = 'CUSTOMER_PAYMENT',
  SUPPLIER_PAYMENT = 'SUPPLIER_PAYMENT'
}

export enum SessionStatus {
  PREV = 'PREV',
  CLOSED = 'CLOSED'
}

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user'
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid'
}

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK = 'bank',
  CREDIT = 'credit'
}

export enum OrderStatus {
  PENDING = 'pending',
  EMPTY = 'empty',
  FAILED = 'failed',
  FULFILLED = 'fulfilled',
  EXTENDED = 'extended',
  ORDER_DEFAULT = 'order_default'
}

export enum InventoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED'
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}
