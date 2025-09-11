import { CreatePurchaseRequest } from '@src/features/purchase/interface/purchase.interface';

// Batch payables
export enum PaymentType {
  FULL = 'full',
  PARTIAL = 'partial',
  CREDIT = 'credit'
}

export enum PayableStatus {
  SETTLED = 'settled',
  UNSETTLED = 'unsettled'
}

export interface BatchPayables {
  payable_id: string;
  purchase_id: string;
  amount_due: string;
  total_paid: string;
  status: PayableStatus;
  payment_type: PaymentType;
  balance_due: string;
  settlement_date?: string | null;
  created_at: string;
  updated_at: string;

  batchpayable?: CreatePurchaseRequest;
}
