// import { SessionStatus } from '@src/shared/globals/enums/ts.enums';
import { CashBookLedger } from './cashbook-ledger.interface';
import { AccountCollection } from './accounts.interface';
import { PosSession } from '@src/features/pos/interface/pos.interface';
import { Decimal } from '@prisma/client/runtime/library';

export interface OpeningClosingBalance {
  id: string;
  pos_session_id: string;
  cash_bank_ledger_id: string;
  opening_date: Date;
  closing_date: Date | null;
  status: 'PREV' | 'CLOSED';
  opening_balance: Decimal; // Decimal as Decimal
  closing_balance?: Decimal | null; // Decimal as Decimal | undefined
  total_for_accounts?: Decimal | null; // Decimal as number | undefined

  account_collection_id?: string | null;
  accountCollection?: AccountCollection;
  cashBookLedgers?: CashBookLedger[];
  session?: PosSession;
}

// model OpeningClosingBalance {
//   id                  String        @id @default(uuid()) @db.Uuid
//   pos_session_id      String
//   cash_bank_ledger_id String        @unique @db.Uuid // Nullable if not linked to a specific cash bank ledger
//   opening_date        DateTime      @default(now())
//   closing_date        DateTime?
//   status              SessionStatus @default(PREV) // e.g. PREV, CLOSED
//   opening_balance     Decimal       @db.Decimal(14, 2)
//   closing_balance     Decimal?      @db.Decimal(14, 2)
//   total_for_accounts  Decimal?      @db.Decimal(14, 2)

//   // Link to account snapshot
//   account_collection_id String?            @db.Uuid
//   accountCollection     AccountCollection? @relation(fields: [account_collection_id], references: [collection_id])
//   cashBankLedgers       CashBookLedger[]
//   session               PosSession         @relation(fields: [pos_session_id], references: [pos_session_id])
//   // account         Account   @relation(fields: [accountId], references: [account_id])
// }

// model PosSession {
//   pos_session_id String                @id @default(uuid())
//   posId          String
//   openedBy       String
//   openedAt       DateTime              @default(now())
//   closedBy       String?
//   closedAt       DateTime?
//   status         TerminalSessionStatus @default(CLOSED)
//   createdAt      DateTime              @default(now())

//   openedUser User                    @relation("OpenedSessions", fields: [openedBy], references: [email], onDelete: Cascade)
//   closedUser User?                   @relation("ClosedSessions", fields: [closedBy], references: [email], onDelete: Cascade)
//   balances   OpeningClosingBalance[]
//   // ledgerEntries CashBookLedger[]
// }

// model UserLoginAttempt {
//   id          Int      @id @default(autoincrement())
//   userId      String
//   attemptTime DateTime
//   ipAddress   String
//   userAgent   String
//   status      String // e.g., 'FAILED_ACTIVE_SESSION', 'WRONG_PASSWORD'
//   user        User     @relation(fields: [userId], references: [user_id])
// }

// model User {
//   user_id  String @id @default(uuid())
//   username String
//   email    String @unique
//   password String

//   role      UserRoles
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt

//   UserLoginLog     UserLoginLog[]
//   userLoginAttempt UserLoginAttempt[]
//   PosSessionOpened PosSession[]       @relation("OpenedSessions")
//   PosSessionClosed PosSession[]       @relation("ClosedSessions")
// }

// model UserLoginAttempt {
//   id          Int      @id @default(autoincrement())
//   userId      String
//   attemptTime DateTime
//   ipAddress   String
//   userAgent   String
//   status      String // e.g., 'FAILED_ACTIVE_SESSION', 'WRONG_PASSWORD'
//   user        User     @relation(fields: [userId], references: [user_id])
// }

// model AccountCollection {
//   collection_id String   @id @default(uuid()) @db.Uuid
//   snapshot_date DateTime @default(now())

//   // A snapshot can store many accounts' balances
//   accounts AccountBalanceSnapshot[]

//   created_at DateTime @default(now())
//   updated_at DateTime @updatedAt

//   // Back-reference to session
//   openingClosingBalances OpeningClosingBalance[]
// }

// model AccountCollection {
//   collection_id String   @id @default(uuid()) @db.Uuid
//   snapshot_date DateTime @default(now())

//   // A snapshot can store many accounts' balances
//   accounts AccountBalanceSnapshot[]

//   created_at DateTime @default(now())
//   updated_at DateTime @updatedAt

//   // Back-reference to session
//   openingClosingBalances OpeningClosingBalance[]
// }
