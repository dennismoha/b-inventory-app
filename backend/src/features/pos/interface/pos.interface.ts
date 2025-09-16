import { OpeningClosingBalance } from '@src/features/accounting/interfaces/opening-closing-balance.interface';
import { User } from '@src/features/auth/interfaces/auth.interface';
import { TerminalSessionStatus } from '@src/shared/globals/enums/ts.enums';

export interface PosSession {
  pos_session_id: string;
  posId: string;
  openedBy: string;
  openedAt: Date;
  closedBy?: string;
  closedAt?: Date;
  status: TerminalSessionStatus;
  createdAt: Date;

  openedUser: User;
  closedUser?: User;
  balances: OpeningClosingBalance[];
}

export type pos_session_header = { pos_session_id: string };
