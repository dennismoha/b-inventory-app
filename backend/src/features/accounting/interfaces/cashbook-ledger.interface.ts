// import { TransactionType } from '@src/features/purchase/interface/purchase.interface';
import { Account } from './accounts.interface';
import { ReferenceType } from '@src/shared/globals/enums/ts.enums';
import { OpeningClosingBalance } from './opening-closing-balance.interface';
import { Decimal } from '@prisma/client/runtime/library';

export interface CashBookLedger {
  ledger_id: string;
  opening_closing_balance_id: string;
  transaction_date: Date;
  transaction_type: 'INFLOW' | 'OUTFLOW';
  amount: Decimal;
  method: 'CASH' | 'BANK' | 'CREDIT' | 'CARD';
  reference_type: ReferenceType;
  reference_id?: string | null;
  balance_after: Decimal | null;
  description?: string | null;
  created_at: Date;
  updated_at: Date;

  // Relations
  account_id: string;
  AccountInfo?: Account;
  openingClosingBalance?: OpeningClosingBalance;
}

type UUID = string;
type ISODate = string | Date;

type TransactionType = 'INFLOW' | 'OUTFLOW';

type Status = 'CLOSED' | 'PREV' | string;

type CashBookLedgerEntry = {
  transaction_date: ISODate;
  transaction_type: TransactionType;
  amount: number;
  method: string;
  // description: string | null;
  account_name: string | undefined;
} & Pick<CashBookLedger, 'description'>;

interface CashBookLedgers {
  inflows: CashBookLedgerEntry[];
  outflows: CashBookLedgerEntry[];
  total_inflows: number;
  total_outflows: number;
  net_balance: number;
}

export type CashbookLedgerRecords = {
  id?: UUID;
  pos_session_id: UUID;
  cash_bank_ledger_id?: UUID;

  opening_date: ISODate;
  closing_date: ISODate | null;

  status: Status;

  cashBookLedgers: CashBookLedgers | string[];
} & Pick<OpeningClosingBalance, 'account_collection_id' | 'closing_balance' | 'total_for_accounts'>;
