import { CreatePurchaseRequest } from '@src/features/purchase/interface/purchase.interface';
import { OpeningClosingBalance } from './opening-closing-balance.interface';
import { CashBookLedger } from './cashbook-ledger.interface';
import { Decimal } from '@prisma/client/runtime/library';

// Enums
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED'
}

// this is for what is returned in the balance sheet
export type journalLines = {
  line_id: string;
  entry_id: string;
  account_id: string;
  debit: string;
  credit: string;
};

// Account type
export interface Account {
  account_id: string;
  name: string;
  account_number?: string | null;
  type: 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'EQUITY' | 'INCOME';
  description?: string | null;
  opening_balance: Decimal; // Prisma Decimal is best handled as string in TS
  running_balance: Decimal;
  deleted: boolean;
  account_status: 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'CREATED';
  created_at: Date; // Date as ISO Date
  updated_at: Date;

  // Relations (can be expanded to real types later)
  Purchase?: CreatePurchaseRequest[];
  CashBookLedgers?: CashBookLedger[];
  AccountBalances?: AccountBalanceSnapshot[];
  AccountStatusLog?: AccountStatusLog[];
}

export interface AccountCollection {
  collection_id: string;
  snapshot_date: Date;
  accounts: AccountBalanceSnapshot[];
  created_at: Date;
  updated_at: Date;
  openingClosingBalances: OpeningClosingBalance[];
}

export interface AccountBalanceSnapshot {
  id: string;
  account_id: string;
  balance: string; // Decimal
  snapshot_date: Date;
  account: Account;
}

export interface AccountBalanceSnapshot {
  id: string;
  account_id: string;
  balance: string; // Decimal
  snapshot_date: Date;
  account: Account;
}

export interface AccountStatusLog {
  id: string;
  account_id: string;
  old_status: string;
  new_status: string;
  changed_by?: string | null;
  changed_at: string;

  // Relations
  account?: Account;
}

export type TrialBalance = {
  totalDebit: number;
  totalCredit: number;
  trialBalance: {
    name: string;
    account_type: AccountType;
    debit: number;
    credit: number;
  }[];
};
