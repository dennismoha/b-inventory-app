// =====================
// ENUMS
// =====================
export enum SessionStatus {
  PREV = 'PREV',
  CLOSED = 'CLOSED'
}

export enum TerminalSessionStatus {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN' // If you have this in schema (assuming)
}

export enum UserRoles {
  admin = 'admin',
  user = 'user'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK = 'bank',
  CREDIT = 'credit'
}

export type ReferenceType = 'SALE' | 'PURCHASE_PAYMENT' | 'EXPENSE' | 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT' | 'ACCOUNT_TOPUP';
