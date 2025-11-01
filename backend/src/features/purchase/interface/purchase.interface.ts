// export type PaymentType = 'CASH' | 'CREDIT';
// export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
// export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIALLY_PAID';

import { PartialPaymentLog } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Enum helpers (keep aligned with your Prisma enums)
export type PaymentType = 'full' | 'partial' | 'credit' | 'full_split';
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK' | 'CREDIT';
export type TransactionType = {
  INFLOW: 'INFLOW';
  OUTFLOW: 'OUTFLOW';
};

// export type ReferenceTypes = {
//   SALE: 'SALE';
//   PURCHASE_PAYMENT: 'PURCHASE_PAYMENT';
//   EXPENSE: 'EXPENSE';
//   CUSTOMER_PAYMENT: 'CUSTOMER_PAYMENT';
//   SUPPLIER_PAYMENT: 'SUPPLIER_PAYMENT';
// }

export type ReferenceTypes = 'SALE' | 'PURCHASE_PAYMENT' | 'EXPENSE' | 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT';

export interface CreatePurchaseRequest {
  batch: string;
  supplier_products_id: string; // UUID
  quantity: number;
  damaged_units: number;
  reason_for_damage: string | null;
  unit_id: string; // UUID
  purchase_cost_per_unit: Decimal;
  total_purchase_cost: Decimal;
  discounts: Decimal;
  tax: Decimal;
  payment_type: PaymentType;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_date?: Date | null; // ISO date
  account_id?: string | null; // UUID
  payment_reference: string | null;
  arrival_date: Date; // ISO date
}

export type purchaseList = CreatePurchaseRequest & {
  purchase_id: string; // UUID
};

export interface CreatePurchaseResponse {
  message: string;
  data: {
    purchase_id: string;
    batch: string;
    total_purchase_cost: number;
    damaged_units: number;
    total_units: number;
    payment_type: PaymentType;
  };
}

export interface ErrorResponse {
  error: string;
}

export interface PartialPurchasePayment {
  partial_purchase_id: string;
  purchase_id: string;
  full_amount: string;
  initial_payment: string;
  balance: string;
  payment_method: PaymentMethod;
  payment_date: string;
  created_at: string;

  // Relations
  Purchase?: CreatePurchaseRequest;
  Logs?: PartialPaymentLog[];
}

export type BatchPayableResult = {
  payable_id: string;
  purchase_id: string;
  total_paid: Decimal;
  batch: string | null;
  supplier_name: string | null;
  product_name: string | null;
};

export type FormattedBatchInventory = {
  batchInventory: string;
  purchaseId: string;
  totalUnits: number;
  status: string;
  createdAt: Date;
  batch: string;
  supplierName: string;
  productName: string;
};

export type PurchasePayable = {
  partial_payment_id: string;
  purchase_id: string;
  amount_paid: Decimal;
  initial_payment: Decimal;
  balance: Decimal;
  payment_method: PaymentMethod;
  payment_date: Date;
};

export type PurchasePayableResponse = {
  balance_due: Decimal;
};
