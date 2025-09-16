import { Decimal } from '@prisma/client/runtime/library';
import { Account } from './accounts.interface';

export interface BalanceSheetResponse {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  totals: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
}

export interface ProfitAndLossResponse {
  incomeAccounts: Account[];
  expenseAccounts: Account[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

// cashflow
export interface CashflowSection {
  inflow: number;
  outflow: number;
  net: number;
}

// Totals type
export interface CashflowTotals {
  netCashflow: number;
}

// Full Cashflow Statement type
export interface CashflowStatement {
  operating: CashflowSection;
  investing: CashflowSection;
  financing: CashflowSection;
  totals: CashflowTotals;
}

export interface JournalLineInput {
  account_id: string;
  debit?: Decimal;
  credit?: Decimal;
}

export interface JournalEntryInput {
  transactionId: string; // links to the POS transaction
  description: string;
  lines: JournalLineInput[];
}
