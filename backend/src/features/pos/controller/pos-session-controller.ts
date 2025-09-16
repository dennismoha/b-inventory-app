/**
 * user logs in to the system
 * i need a table to register a user has been logged in , time .
 * Also on the same table we can register the user has logged out.
 *
 * after registering a user logged in, I should check if the user has an active opening session. That should either be in my req.session or jwt or table.
 * So i need a Session Table to register active daily sessions for opening/closing balance .
 * if no session, return to the user that they are logged in
 *  on the frontend show a modal for create session.
 * once the session has been created we need to tie those details to either our jwt or req.session.
 *   This session should persist beyond user login/logout
 * Then on the frontend we can show the user the session details.
 * Then next it should prompt the user to enter the opening balance for that session. The opening balance should be the previous balance for the previous session and it should be registered at the cash register
 *  The opening balance should be saved in the session table.
 * I also need a  opening/closing balance table to register the opening / closing balance  in respective accounts. That way i can be able to track the opening and closing balances for each account.
 *
 * So once the opening balance has been entered, we can then proceed to the next step of the session.
 * Now, once that is done we should be able to save the issession for the day open in our either localstorage or session storage.using redux or context api.
 * Thhis should persist beyond user login/logout.
 * Even if the sesssion is on but user is logged out , logout screen should show untill the drawer is closed then we can wrap that.
 *
 *
 * To close a session ,
 *  All the above details should be saved in the respective tables. req.sesssion should be cleared and the session in our localStorage or whatever should be cleared.
 * closing session for whoever closed should also be recorded.
 *
 * The above makes sure that  any operation in the system at any tine us raccounted for in a session. and this can be able to track who did what under each sesion.
 *
 *
 *
 *
 *
 *
 */

/***
 *  so creating a session will involve the following steps:
 * 1. Check if the user has an active session.
 *  
    * model PosSession {
    pos_session_id           String                     @id @default(uuid())
    posId   String
    openedBy     String 
    openedAt     DateTime                 @default(now())
    closedBy     String? 
    closedAt     DateTime?
    status       TerminalSessionStatus            @default(CLOSED)
    createdAt    DateTime                 @default(now())

    openedUser   User                     @relation("OpenedSessions", fields: [openedBy], references: [user_id])
    closedUser   User?                    @relation("ClosedSessions", fields: [closedBy], references: [user_id])
    balances     OpeningClosingBalance[]
    // ledgerEntries CashBookLedger[]
    }

 * 
 * 2. If no active session, create a new session.
 * AGain since , prev closing balance is the opening balance for the new session, we neeed to set the status of the session to CLOSED.
 * In the new OpeningClosingBalance table record, we need to  create a new cash_bank_ledger id for tracking caashbook records for that day
 *  model OpeningClosingBalance {
  id                String     @id @default(uuid()) @db.Uuid
  pos_session_id         String   
  cash_bank_ledger_id String @unique @db.Uuid // Nullable if not linked to a specific cash bank ledger
  opening_date       DateTime   @default(now())
  closing_date       DateTime?
  status             SessionStatus @default(PREV) // e.g. PREV, CLOSED
  opening_balance    Decimal    @db.Decimal(14, 2)
  closing_balance    Decimal?   @db.Decimal(14, 2)
  total_for_accounts Decimal?   @db.Decimal(14, 2)

  // Link to account snapshot
  account_collection_id String? @db.Uuid
  accountCollection     AccountCollection? @relation(fields: [account_collection_id], references: [collection_id])
  cashBankLedgers CashBookLedger[]
  session         PosSession   @relation(fields: [pos_session_id], references: [pos_session_id])
  // account         Account   @relation(fields: [accountId], references: [account_id])
}
  enum SessionStatus {
  PREV
  CLOSED
}


 * 
 * Those records will be stored in the cashbook ledger table.
 * model CashBookLedger {
        ledger_id        String           @id @default(uuid())
        opening_closing_balance_id String  @db.Uuid// Nullable if not linked to a specific opening/closing balance
        transaction_date DateTime  @default(now())
        transaction_type            TransactionType
        amount          Decimal    @db.Decimal(12, 2)
        method          PaymentMethod
        reference_type ReferenceType
        reference_id    String?    @db.Uuid // Can be null if no specific reference
        balance_after  Decimal    @db.Decimal(14, 2) @default(0.00)
        description     String?
        created_at      DateTime   @default(now())
        updated_at      DateTime   @updatedAt

        // Relations
        account_id      String     @db.Uuid
        account         Account    @relation(fields: [account_id], references: [account_id])
        
        // Linked to OpeningClosingBalance session
        openingClosingBalance OpeningClosingBalance? @relation(fields: [opening_closing_balance_id], references: [cash_bank_ledger_id])
        
        // TerminalSessionId Int? // Nullable if not linked to a terminal session

        }
 * 
        since we have opening_balance, and closing,balance we caklculate total_for_accounts as the sum of all the balances for all the accounts in the session.
        we also need to save account_collection_id to link the session to the account collection for that day. this should be similar to the prev record marked by prev

        Then return the pos_session and user details to the frontend.
        An active session will have been created and the user can now proceed to use the system.



        /***
         * 
         * CLOSING A SESSION
         * create a collection id in the AccountCollectio table to link the AccountCollection to the AcccountBalanceSnapshot table.
         *  
         * model AccountCollection {
                collection_id String     @id @default(uuid()) @db.Uuid
                snapshot_date DateTime   @default(now())

                // A snapshot can store many accounts' balances
                accounts      AccountBalanceSnapshot[]

                created_at    DateTime   @default(now())
                updated_at    DateTime   @updatedAt

                // Back-reference to session
                openingClosingBalances OpeningClosingBalance[]
}
         * 
         * in the account snapshot table we'll fetch  all the accounts for that day with balance being the current balance for that account.
         *    I think this will be select * cirrentUser balance from the accounts table. 
         * save each record with it's respective  account_id. save the cokkctiion string to collection_id
         * model AccountBalanceSnapshot {
                    snapshot_id  String   @id @default(uuid()) @db.Uuid
                    account_id   String   @db.Uuid
                    account      Account  @relation(fields: [account_id], references: [account_id])
                    balance      Decimal  @db.Decimal(14, 2)
                    
                    collection_id String  @db.Uuid
                    collection    AccountCollection @relation(fields: [collection_id], references: [collection_id])
                    }
         * 
         * 
         * Now harmed with those details we come to OpeningClosingBalance table to create a update the opened record with the following details:
         *  closing_date: Date.now(),
         * clsoing balance sum of all total balances for all accounts in the session.
         * add a ccount_collection_id.
         * save others
         * 
         * Then in our PosSession table we update the session with the following details: and set the status to CLOSED.
         * Then we returnthe session details to the frontend, erase it all log the user out and also on frontend erase all auth and PosSession from localstorage.
         * Now the user is lgged out without any PosSession
         * that way we can't have a lloggedin user without an ooensession
         * 
         */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client';
import { ConflictError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
import { v4 as uuidv4 } from 'uuid';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { pos_session_header } from '../interface/pos.interface';

export class PosSessionController {
  /**
   * Open a new POS session
   * Steps:
   * 1. Check if user already has an active session
   * 2. If no active session, get the previous session's closing balance
   * 3. Create a new POS session (OPEN status)
   * 4. Generate a cash_bank_ledger_id for the new OpeningClosingBalance
   * 5. Save the OpeningClosingBalance record with opening_balance from previous session
   * 6. Create the initial CashBookLedger record linked to cash_bank_ledger_id
   * 7. go through all active accounts and set the running_balance = new opening_balance and both should match
   * 
   * model Account {
        account_id      String        @id @default(uuid()) @db.Uuid
        name            String
        account_number  String?       @unique
        type            AccountType
        description     String?
        opening_balance         Decimal       @default(0.00) @db.Decimal(14, 2)
        running_balance Decimal       @default(0.00) @db.Decimal(14, 2)
        deleted         Boolean       @default(false) // Soft delete flag
        account_status  AccountStatus @default(ACTIVE) // ACTIVE, INACTIVE, CLOSED
        created_at      DateTime      @default(now())
        updated_at      DateTime      @updatedAt

        Purchase         Purchase[] // Purchases made through this account
        // Relations
        AccountInfo      CashBookLedger[]
        AccountBalances  AccountBalanceSnapshot[]
        AccountStatusLog AccountStatusLog[]
        // OpeningClosingBalance OpeningClosingBalance[]
      }

   * 8. for each setup stave that in AccountsessionLog
   * 
   * model AccountSessionLog {
        id              String   @id @default(cuid())
        account_id      String
        opening_balance Decimal
        closing_balance Decimal
        pos_session     String
        user            String
        created_at      DateTime @default(now())

        @@map("account_session_log") // Optional: map to table name if needed
      }
   * 9. Return session + user details
   */
  // public async openSession(req: Request, res: Response): Promise<Response> {

  //   const posId = 'posid';
  //   const openedBy = req.currentUser!.email; // Get the user ID from the current user context

  //   // console.log('currentUser:', req.currentUser);
  //   // return res.status(StatusCodes.OK).json({
  //   //   message: 'POS session opening not implemented yet',
  //   //   data: {
  //   //     posId,
  //   //     openedBy
  //   //   }
  //   // });

  //   // Step 1: Check if the user already has an active session
  //   const activeSession = await prisma.posSession.findFirst({
  //     where: { openedBy, status: 'OPEN' }
  //   });
  //   if (activeSession) {
  //     throw new ConflictError('You already have an active POS session.');
  //   }

  //   // Step 2: Get the last CLOSED session's closing balance & account_collection_id
  //   const lastClosedBalance = await prisma.openingClosingBalance.findFirst({
  //     where: { status: 'CLOSED' },
  //     orderBy: { closing_date: 'desc' }
  //   });

  //   const openingBalance = lastClosedBalance?.closing_balance || 0;
  //   const prevAccountCollectionId = lastClosedBalance?.account_collection_id || null;

  //   // Step 3: Create the new POS session (set status to OPEN)
  //   const newPosSession = await prisma.posSession.create({
  //     data: {
  //       posId,
  //       openedBy,
  //       status: 'OPEN'
  //     }
  //   });

  //   // Step 4: Generate the master cash_bank_ledger_id
  //   const cashBankLedgerId = uuidv4();

  //   // Step 5: Create the OpeningClosingBalance record
  //   const openingClosingBalance = await prisma.openingClosingBalance.create({
  //     data: {
  //       pos_session_id: newPosSession.pos_session_id,
  //       cash_bank_ledger_id: cashBankLedgerId,
  //       opening_balance: openingBalance,
  //       status: 'PREV',
  //       account_collection_id: prevAccountCollectionId
  //     }
  //   });

  //   console.log('OpeningClosingBalance created:', openingClosingBalance);

  //   // Step 6: Create the initial CashBookLedger record for opening balance
  //   // await prisma.cashBookLedger.create({
  //   //   data: {
  //   //     // ledger_id: uuidv4(),
  //   //     opening_closing_balance_id: cashBankLedgerId,
  //   //     account_id: mainAccountId,
  //   //     transaction_type: 'OPENING_BALANCE',
  //   //     amount: openingBalance,
  //   //     method: 'CASH',
  //   //     reference_type: 'POS_SESSION',
  //   //     reference_id: newPosSession.pos_session_id,
  //   //     balance_after: openingBalance,
  //   //     description: `Opening balance for POS session ${newPosSession.pos_session_id}`
  //   //   }
  //   // });

  //   console.log('pos current user:', req.currentUser);

  //   // Step 7: Get user details and return
  //   req.currentUser!.posSessionId = newPosSession.pos_session_id; // Set the session ID in the current user context
  //   // const userDetails = await prisma.user.findUnique({
  //   //   where: { user_id: openedBy },
  //   //   select: { user_id: true, name: true, email: true }
  //   // });

  //   return res.status(StatusCodes.CREATED).json({
  //     message: 'POS session opened successfully',
  //     data: {
  //       session: newPosSession,
  //       // openingClosingBalance,
  //       // user: userDetails
  //     }
  //   });
  // }
  public async openSession(req: Request, res: Response): Promise<Response> {
    const posId = 'posid';
    const openedBy = req.currentUser!.email;

    // Step 1: Check if the user already has an active session
    const activeSession = await prisma.posSession.findFirst({
      where: { openedBy, status: 'OPEN' }
    });

    if (activeSession) {
      throw new ConflictError('You already have an active POS session.');
    }

    // Step 2: Get the last CLOSED session's closing balance & account_collection_id
    const lastClosedBalance = await prisma.openingClosingBalance.findFirst({
      where: { status: 'CLOSED' },
      orderBy: { closing_date: 'desc' }
    });

    const openingBalance = lastClosedBalance?.closing_balance || 0;
    const prevAccountCollectionId = lastClosedBalance?.account_collection_id || null;

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 3: Create the new POS session (set status to OPEN)
      const newPosSession = await tx.posSession.create({
        data: {
          posId,
          openedBy,
          status: 'OPEN'
        }
      });

      // Step 4: Generate the master cash_bank_ledger_id
      const cashBankLedgerId = uuidv4();

      // Step 5: Create the OpeningClosingBalance record
      await tx.openingClosingBalance.create({
        data: {
          pos_session_id: newPosSession.pos_session_id,
          cash_bank_ledger_id: cashBankLedgerId,
          opening_balance: openingBalance,
          status: 'PREV',
          account_collection_id: prevAccountCollectionId
        }
      });

      // Step 6: Create the initial CashBookLedger record (if needed)
      // Skipped for now

      // Step 7 & 8: Update active accounts and log them
      const activeAccounts = await tx.account.findMany({
        where: {
          deleted: false,
          account_status: 'ACTIVE'
        }
      });

      for (const account of activeAccounts) {
        const opening = account.opening_balance;

        if (account.running_balance !== opening) {
          await tx.account.update({
            where: { account_id: account.account_id },
            data: { running_balance: opening }
          });
        }

        await tx.accountSessionLog.create({
          data: {
            account_id: account.account_id,
            opening_balance: opening,
            closing_balance: opening,
            pos_session: newPosSession.pos_session_id,
            user: openedBy
          }
        });
      }

      return newPosSession;
    });

    // Step 9: Attach POS session to currentUser & return response
    req.currentUser!.posSessionId = result.pos_session_id;

    return res.status(StatusCodes.CREATED).json({
      message: 'POS session opened successfully',
      data: {
        session: result
      }
    });
  }

  /**
   * Close an active POS session
   */
  public async closeSession(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.currentUser!;
      console.log('Current User>>>>>>>>>>>>:', currentUser?.posSessionId, '  /n req ', req.currentUser);
      console.log('req pos led ', req.posLedgerId);
      if (!req.posLedgerId) {
        res.status(400).json({ message: 'No active session to close.' });
        return;
      }

      const sessionId = req.possession;

      // 1. Create AccountCollection record
      const accountCollection = await prisma.accountCollection.create({
        data: {
          collection_id: uuidv4(),
          snapshot_date: new Date()
        }
      });

      // 2. Get all accounts and save snapshots
      const accounts = await prisma.account.findMany({
        where: { deleted: false }
      });

      const snapshots = accounts.map((acc) => ({
        snapshot_id: uuidv4(),
        account_id: acc.account_id,
        balance: acc.running_balance,
        collection_id: accountCollection.collection_id
      }));

      await prisma.accountBalanceSnapshot.createMany({
        data: snapshots
      });

      // 3. Calculate total closing balance
      const totalClosingBalance = accounts.reduce((sum, acc) => {
        return sum + Number(acc.running_balance);
      }, 0);

      // 4. Update OpeningClosingBalance
      await prisma.openingClosingBalance.updateMany({
        where: {
          pos_session_id: sessionId,
          closing_date: null
        },
        data: {
          closing_date: new Date(),
          closing_balance: totalClosingBalance,
          total_for_accounts: totalClosingBalance,
          account_collection_id: accountCollection.collection_id,
          status: 'CLOSED'
        }
      });

      // 5. Update PosSession
      await prisma.posSession.update({
        where: { pos_session_id: sessionId },
        data: {
          closedBy: currentUser.email,
          closedAt: new Date(),
          status: 'CLOSED'
        }
      });

      // 6. Remove session from current user context
      currentUser.posSessionId = undefined;

      // 7. Return updated session
      res.status(200).json({
        message: 'POS session closed successfully.',
        sessionId: sessionId,
        closedBy: currentUser.email,
        closingBalance: totalClosingBalance
      });
    } catch (error) {
      console.error('Error closing POS session:', error);
      res.status(500).json({ message: 'Failed to close POS session.' });
    }
  }

  /**
   * Checks if the current user has an active POS session.
   * This is meant to be used as middleware in protected routes.
   */
  public async checkPosSession(req: Request, res: Response): Promise<Response | void> {
    // const posSessionId = req.headers['pos-session-id'] as string;

    const posSessionId: pos_session_header | null = await prisma.posSession.findFirst({
      where: {
        status: 'OPEN'
      },
      select: {
        pos_session_id: true
      }
    });

    if (!posSessionId) {
      throw new NotFoundError('No active POS session found for the user.');
    }

    console.log('Active POS session found:', posSessionId);
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, posSessionId, 'pos session found'));
    // res.json({
    //   message: 'POS session is',
    //   posSessionId
    // });
    // 1️Check if the POS session exists and is active
    // const session = await prisma.posSession.findUnique({
    //   where: { id: posSessionId },
    // });

    // if (!session || !session.active) {
    //   throw new BadRequestError('Invalid or expired POS session');
    // }

    // // 2️Attach to request for downstream use
    // (req as any).posSession = session;

    // return; // Let Express call the next middleware
  }
}
