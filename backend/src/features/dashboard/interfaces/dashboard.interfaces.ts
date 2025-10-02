import { Decimal } from '@prisma/client/runtime/library';

export interface UserSummary {
  email: string;
  username: string;
}

export interface BalanceSummary {
  id: string;
  opening_date: Date; // ISO date
  closing_date: Date | null; // ISO date
  opening_balance: Decimal;
  closing_balance: Decimal | null;
  total_for_accounts: Decimal | null;
}

export interface PosSessionSummary {
  pos_session_id: string;
  posId: string;
  openedBy: string;
  openedAt: Date;
  closedBy: string | null;
  closedAt: Date | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
  openedUser: UserSummary;
  closedUser: UserSummary | null;
  balances: BalanceSummary[];
}

export interface TotalsSummary {
  suppliers: number;
  customers: number;
  employees: number;
  receivables: number;
  sales: {
    count: number;
    total: number;
  };
  purchases: {
    count: number;
    total: number;
  };
  expenses: {
    count: number;
    total: number;
  };
  payables: {
    count: number;
    total: number;
  };
}

export interface SeriesItem {
  date: string; // "YYYY-MM-DD"
  count: number;
  total: number;
}

export interface SeriesSummary {
  sales: SeriesItem[];
  purchases: SeriesItem[];
  expenses: SeriesItem[];
  payables: SeriesItem[];
}

export interface AdminDashboardFilters {
  start: Date; // ISO date
  end: Date; // ISO date
}

export interface AdminDashboardResponse {
  filters: AdminDashboardFilters;
  posSessions: PosSessionSummary[];
  totals: TotalsSummary;
  series: SeriesSummary;
}
