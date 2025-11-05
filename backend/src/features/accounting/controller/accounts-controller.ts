/**
 *
 * This controller handles the accounting operations related to purchases.
 * It includes methods for creating, updating, and deleting  records,
 *
 * so we will need to create a new table for accounting with the following columns:
 * - accounting_id String @id @default(uuid()) @db.Uuid
 * - account_number String @unique
 * - account_type AccountType
 * - description String?
 * - opening_balance Decimal @db.Decimal(12, 2) @default(0.00
 * - account_status AccountStatus @default(ACTIVE) // ACTIVE, INACTIVE, CLOSED
 * - Running balance Decimal @db.Decimal(12, 2) @default(0.00)
 * - deleted Boolean @default(false) // Soft delete flag
 * - created_at DateTime @default(now())
 * - updated_at DateTime @updatedAt
 * - deleted_at DateTime? // Nullable for soft delete
 *
 *
 * AccountStatus enum {
 *   ACTIVE
 *  INACTIVE
 *  CLOSED
 * }
 *
 * AccountType enum {
 *   cASH
 *   BANK
 *  CREDIT
 * }
 *
 * # rules:
 * * - The account_number must be unique.
 * * - The opening_balance must be a positive number.
 * * - The account_status must be one of the following: ACTIVE, INACTIVE, CLOSED.
 * * - The account_type must be one of the following: CASH, BANK, CREDIT.
 * * - We cannot add or remove money from an account that is closed.
 * * - We cannot delete an account that has a balance greater than 0.
 * * - We cannot delete an account that has transactions associated with it.
 * * - We cannot update an account that is closed.
 * * - We cannot update an account that has transactions associated with it. eg changin the account number
 * * -We cannot add - numbers to opening balance
 * * - We cannot add a negative number to the opening balance.
 *
 *
 * So now we need another table for showing transactions related to the accounting operations
 *  * - transaction_id String @id @default(uuid()) @db.Uuid
 * - account_id String @db.Uuid
 * - transaction_type TransactionType
 * - amount Decimal @db.Decimal(12, 2)
 * - description String?
 * - transaction_date DateTime @default(now())
 * - balance_after_transaction Decimal @db.Decimal(12, 2) // Balance after this transaction
 * -refrence type ReferenceType
 *
 * * ReferenceType enum {
 *      PURCHASE // Purchase transaction
 *      SALE // Sale transaction
 *      }
 * * TransactionType enum {
 *  DEBIT // Money going out of the account
 *  CREDIT // Money coming into the account
 *  }
 *
 *
 * # updating the account balance
 * # RULES:
 * * - When a transaction is made, the account balance must be updated accordingly.
 * * - If the transaction is a debit, the balance must be reduced by the amount of the transaction.
 * * - If the transaction is a credit, the balance must be increased by the amount of the transaction.
 * * - You cannot update the balance of an account that is closed.
 * * - You cannot update a soft-deleted account.
 *
 * # deleteing an account
 * # RULES:
 * * - You cannot delete an account that has a balance greater than 0.
 * * - You cannot delete an account that has transactions associated with it.
 * * - You can delete an account that is closed but with not related transactions.
 * * - You can delete an account that is inactive but with not related transactions.
 * * - You can delete an account that is active but with not related transactions.
 * * - deleting will be soft delete, meaning the account will be marked as deleted and not actually removed from the database.
 *
 * # There needs to be a column for showing sof deleted acounts.
 *  you can undelete deleted accounts by setting the deleted column to false.
 *
 *
 *
 *
 */

// src/controllers/accountController.ts

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client';
import { BadRequestError, ConflictError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { accountSchema, accountStatusSchema, AccountTopSchema } from '@src/features/accounting/schema/account-schema';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Account, AccountType, TrialBalance } from '../interfaces/accounts.interface';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * AccountController
 *
 * Handles CRUD operations for accounts.
 * Accounts represent tracked money entities (e.g., Cash, Bank, M-Pesa, etc.).
 */
export class AccountController {
  static opening_closing_balance: string | '';
  static opening_closing_balance_id: string;
  /**
   * fetch  all accounts
   */

  public async getAccounts(req: Request, res: Response): Promise<Response> {
    const accounts: Account[] = await prisma.account.findMany({
      where: { deleted: false },
      orderBy: { created_at: 'desc' }
    });
    return res.status(StatusCodes.OK).send(GetSuccessMessage(200, accounts, 'accounts returned succesfully'));
  }

  /**
   * Create a new account.
   */
  @joiValidation(accountSchema)
  public async createAccount(req: Request, res: Response): Promise<Response> {
    const { name, type, account_number, balance } = req.body;
    console.log('Creating account with data:', req.body);
    const opening_balance = balance;

    // Check if account with the same name exists (active only)
    const existingAccount = await prisma.account.findFirst({
      where: { account_number }
    });
    if (existingAccount) {
      throw new ConflictError(`Account  with number "${account_number} -${name}" already exists`);
    }

    const account = await prisma.account.create({
      data: {
        name,
        account_number,
        type,
        // description,
        opening_balance,
        running_balance: balance,
        deleted: false, // Ensure new accounts are not marked as deleted
        account_status: 'ACTIVE' // Default status for new accounts
      }
    });

    //     await prisma.accountStatusLog.create({
    //   data: {
    //     account_id: account.account_id,
    //     event_type: "CREATED",
    //     status: account.account_status,
    //     changed_by: req.currentUser!.email
    //   }
    // });

    return res.status(StatusCodes.CREATED).send(GetSuccessMessage(201, account, 'account created succesfully'));

    // json({
    //   message: 'Account created successfully',
    //   data: account
    // });
  }

  /**
   * Get all active accounts.
   */
  public async getAllAccounts(req: Request, res: Response): Promise<Response> {
    const accounts = await prisma.account.findMany({
      where: { deleted: false },
      orderBy: { created_at: 'desc' }
    });

    return res.status(StatusCodes.OK).json({
      message: 'Accounts fetched successfully',
      data: accounts
    });
  }

  /**
   * Get account by ID.
   */
  public async getAccountById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: { account_id: id }
    });

    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    return res.status(StatusCodes.OK).json({
      message: 'Account fetched successfully',
      data: account
    });
  }

  /**
   * Update account details (excluding deletion).
   */
  // @joiValidation(accountSchema)
  public async updateAccount(req: Request, res: Response): Promise<Response> {
    console.log('Updating account with data:', req.body);
    console.log('Account ID from params:', req.params);
    const { accountId } = req.params;
    const { name, type, balance, account_number } = req.body;
    const opening_balance = balance;

    // 1. Check if account exists
    const accountExists = await prisma.account.findFirst({
      where: { account_id: accountId, deleted: false }
    });

    if (!accountExists) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    if (accountExists.deleted) {
      throw new BadRequestError(`Account with ID ${accountId} is deleted and cannot be updated`);
    }

    console.log('Account exists:', accountExists);

    // 2. If account_number is being updated, check for existing ledger records
    if (account_number && account_number !== accountExists.account_number) {
      const ledgerCount = await prisma.cashBookLedger.count({
        where: { account_id: accountId }
      });

      if (ledgerCount > 0) {
        throw new BadRequestError(
          'You cannot update the account number because transactions already exist in the cash book ledger for this account.'
        );
      }
    }

    // 3. Update account
    const updatedAccount = await prisma.account.update({
      where: { account_id: accountId },
      data: {
        name,
        type,
        // description,
        opening_balance
      }
    });

    return res.status(StatusCodes.OK).json({
      message: 'Account updated successfully',
      data: updatedAccount
    });
  }

  /**
   * Update the status of an account (active, inactive, closed)
   */
  @joiValidation(accountStatusSchema)
  public async updateStatus(req: Request, res: Response): Promise<Response> {
    const { accountId } = req.params;
    const { account_status } = req.body; // expected: 'active', 'inactive', 'closed'

    // . Check if account exists
    const account = await prisma.account.findFirst({
      where: { account_id: accountId, deleted: false }
    });

    if (!account) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    // . If closing the account, make sure balance is zero
    // if (account_status === 'closed' && account.balance !== 0) {
    //   throw new BadRequestError('You cannot close an account that has a non-zero balance.');
    // }

    // 4. Update account_status
    const updatedAccount = await prisma.account.update({
      where: { account_id: accountId },
      data: { account_status }
    });

    //  Log account_status change for audit purposes
    // await prisma.accountStatusLog.create({
    //   data: {
    //     account_id: accountId,
    //     old_status: account.account_status,
    //     new_status: account_status,
    //     changed_by: req.currentUser?.username || null, // if you track user
    //     changed_at: new Date()
    //   }
    // });

    return res.status(StatusCodes.OK).json({
      message: `Account account_status updated to ${account_status} successfully.`,
      data: updatedAccount
    });
  }

  // public async updateAccount(req: Request, res: Response): Promise<Response> {
  //   const { id } = req.params;
  //   const { name, type, description, balance } = req.body;

  //   const accountExists = await prisma.account.findFirst({
  //     where: { account_id: id, deleted: false }
  //   });
  //   if (!accountExists) {
  //     throw new NotFoundError(`Account with ID ${id} not found`);
  //   }

  //   const updatedAccount = await prisma.account.update({
  //     where: { account_id: id },
  //     data: {
  //       name,
  //       type,
  //       description,
  //       balance
  //     }
  //   });

  //   return res.status(StatusCodes.OK).json({
  //     message: 'Account updated successfully',
  //     data: updatedAccount
  //   });
  // }

  /**
   * Soft delete account.
   */
  public async deleteAccount(req: Request, res: Response): Promise<Response> {
    const { accountId } = req.params;
    const id = accountId;

    const accountExists = await prisma.account.findFirst({
      where: { account_id: id, deleted: false }
    });
    if (!accountExists) {
      throw new NotFoundError(`Account with ID ${id} not found or already deleted`);
    }
    console.log('acccount id is ', id);
    await prisma.account.update({
      where: { account_id: id },
      data: { deleted: true }
    });

    return res.status(StatusCodes.OK).json({
      message: 'Account deleted successfully (soft delete)'
    });
  }

  @joiValidation(AccountTopSchema)
  public async topUp(req: Request, res: Response): Promise<Response> {
    const { accountId } = req.params;
    const { amount, description } = req.body;

    const passedPosSessionId = Array.isArray(req.headers['pos_session'])
      ? req.headers['pos_session'][0] // take the first if multiple
      : req.headers['pos_session'] || ''; // fallback to empty string if undefined

    console.log('passedPosSessionId is ', passedPosSessionId);

    const posid = await prisma.openingClosingBalance.findFirst({
      where: { pos_session_id: passedPosSessionId, status: 'PREV' },
      select: { cash_bank_ledger_id: true, id: true }
    });

    console.log(' pos id is ', posid);
    AccountController.opening_closing_balance = posid?.cash_bank_ledger_id ? posid.cash_bank_ledger_id : '';
    AccountController.opening_closing_balance_id = posid!.id;

    // 1️ Check if account exists and is active
    const account = await prisma.account.findUnique({
      where: { account_id: accountId }
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    if (account.account_status !== 'ACTIVE') {
      throw new BadRequestError('Cannot top-up an inactive or closed account');
    }

    console.log('account running balance ', account.running_balance + ' ' + ' ao=mountL ' + amount);

    //  Update account balance
    const updatedAccount = await prisma.account.update({
      where: { account_id: accountId },
      data: {
        running_balance: Number(account.running_balance) + amount
      }
    });

    const data = {
      opening_closing_balance_id: AccountController.opening_closing_balance,
      account_id: accountId,
      transaction_type: 'INFLOW', // top-up means adding money
      amount: amount,
      description: description || 'Account Top-up',
      transaction_date: new Date(),
      method:
        account.type === 'ASSET' ? 'ASSET' : account.type === 'INCOME' ? 'cash' : account.type === 'LIABILITY' ? 'LIABILITY' : 'INCOME',
      reference_type: 'ACCOUNT_TOPUP',
      // reference_id,
      balance_after: updatedAccount.running_balance
      // created_by: req.currentUser?.username || null
    };

    console.log('closing account data is ', data);
    // Record in the ledger
    await prisma.cashBookLedger.create({
      data: {
        opening_closing_balance_id: AccountController.opening_closing_balance,
        account_id: accountId,
        transaction_type: 'INFLOW', // top-up means adding money
        amount: amount,
        description: description || 'Account Top-up',
        transaction_date: new Date(),
        method: account.type === 'ASSET' ? 'BANK' : account.type === 'EQUITY' ? 'BANK' : account.type === 'INCOME' ? 'CREDIT' : 'CREDIT',
        reference_type: 'ACCOUNT_TOPUP',
        reference_id: null,
        balance_after: updatedAccount.running_balance
        // created_by: req.currentUser?.username || null
      }
    });

    // log the account details

    await prisma.accountsLog.create({
      data: {
        account_id: accountId,
        action: 'credit', // or 'debit'
        opening_balance: account.opening_balance, // opening balance before transaction
        old_running_balance: Number(account.running_balance) - amount, // balance after applying transaction
        new_running_balance: account.running_balance, // same as running_balance unless system computes separately
        pos_session_id: passedPosSessionId, // from current POS session
        user: req.currentUser!.email // or user ID
      }
    });

    return res.status(StatusCodes.OK).json({
      message: 'Account topped up successfully',
      data: updatedAccount
    });
  }

  // debit /credit accounts from other services. this is a utility function for that.
  static async adjustBalance(args: {
    tx: PrismaTransactionalClient;
    account_id: string;
    amount: number | Decimal;
    action: 'debit' | 'credit';
    pos_session_id: string;
    user: string;
  }) {
    const { tx, account_id, amount, action, pos_session_id, user } = args;

    const account = await tx.account.findUnique({ where: { account_id } });
    if (!account) {
      throw new BadRequestError('Account not found');
    }

    const opening = new Decimal(account.running_balance);
    const amt = new Decimal(amount);
    const newBalance = action === 'debit' ? opening.minus(amt) : opening.plus(amt);

    //  no negative balances
    if (action === 'debit' && newBalance.lessThan(0)) {
      throw new BadRequestError('Insufficient funds for debit');
    }

    await tx.account.update({
      where: { account_id },
      data: { running_balance: newBalance }
    });

    await tx.accountsLog.create({
      data: {
        account_id,
        action,
        opening_balance: opening,
        old_running_balance: newBalance,
        new_running_balance: newBalance,
        pos_session_id,
        user
      }
    });
  }

  // select and return accounts. this is a utility function used to select and return account details
  static async findAccount(args: { tx: PrismaTransactionalClient; name: string; type: AccountType }) {
    const { tx, name, type } = args;

    console.log('name is ', name, ' and type is ', type);
    const account = await tx.account.findFirst({ where: { name, type } });
    console.log('account details are ', account);
    if (!account) {
      throw new BadRequestError('Account not found');
    }

    return account;
  }

  public async getTrialBalance(req: Request, res: Response) {
    // Fetch all active accounts
    const accounts = await prisma.account.findMany({
      where: { deleted: false },
      select: {
        name: true,
        type: true,
        running_balance: true
      },
      orderBy: { type: 'asc' }
    });

    // Separate debit and credit for display
    const trialBalance = accounts.map((a) => {
      let debit = 0;
      let credit = 0;
      const running_balanceNum = Number(a.running_balance);

      // Asset & Expense → normal debit
      // Liability, Equity & Income → normal credit
      switch (a.type) {
        case 'ASSET':
        case 'EXPENSE':
          if (running_balanceNum >= 0) debit = Number(running_balanceNum);
          else credit = Math.abs(Number(running_balanceNum));
          break;
        case 'LIABILITY':
        case 'EQUITY':
        case 'INCOME':
          if (running_balanceNum >= 0) credit = Number(running_balanceNum);
          else debit = Math.abs(Number(running_balanceNum));
          break;
      }

      return {
        name: a.name,
        account_type: a.type,
        debit,
        credit
      };
    });

    // Sum totals
    const totalDebit = trialBalance.reduce((sum, a) => sum + a.debit, 0);
    const totalCredit = trialBalance.reduce((sum, a) => sum + a.credit, 0);

    const data: TrialBalance = { trialBalance, totalDebit, totalCredit };
    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, data, 'trial balance returned succesfully'));
  }
}
