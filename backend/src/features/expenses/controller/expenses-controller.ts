import { Request, Response } from 'express';
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { BadRequestError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { expenseCreateSchema } from '@src/features/expenses/schema/expenses-schema';
import { Expense } from '@src/features/expenses/interface/expenses.interface';
import { JournalService } from '@src/features/accounting/controller/journals-controller';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Utilities } from '@src/constants';
import { $Enums } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type expenseType = {
  id: string;
  description: string;
  amount: number;
  category: $Enums.ExpenseCategory;
  expenseDate: Date;
  accountId: string;
  purchaseId: string | null;
  paymentMethod: $Enums.PaymentMethod;
  referenceNo: string | null;
  vendor: string | null;
  batch: string | null;
  status: $Enums.ExpenseStatus;
  isGeneral: boolean;
  createdAt: Date;
  updatedAt: Date;
};
// import { Decimal } from '@prisma/client/runtime/library';

export class ExpensesController {
  /**
   * Fetch all expenses
   */
  public async fetchExpenses(req: Request, res: Response): Promise<void> {
    const expenses: Expense[] = await prisma.expense.findMany({
      include: { purchase: true }
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, expenses, 'Expenses fetched successfully'));
  }

  /**
   * Fetch expense by ID
   */
  public async fetchExpenseById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { purchase: true }
    });

    if (!expense) throw new NotFoundError('Expense not found');

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, expense, 'Expense fetched successfully'));
  }

  /**
   * Create new expense
   */
  @joiValidation(expenseCreateSchema)
  public async createExpense(req: Request, res: Response): Promise<void> {
    console.log('creating an expense ', req.body);
    const {
      purchaseId,
      description,
      amount,
      category,
      expenseDate,
      accountId,
      paymentMethod,
      referenceNo,
      vendor,
      batch,
      isGeneral,
      status
    } = req.body;

    const expense = await prisma.$transaction(async (tx) => {
      //  If tied to a purchase, validate purchase existence
      if (purchaseId) {
        const purchase = await tx.purchase.findUnique({
          where: { purchase_id: purchaseId }
        });
        if (!purchase) {
          throw new NotFoundError('Purchase not found');
        }
      }

      if (status === 'paid') {
        const createdExpense = await tx.expense.create({
          data: {
            description,
            amount: Number(amount),
            category,
            accountId,
            expenseDate,
            paymentMethod,
            referenceNo,
            vendor,
            purchaseId,
            batch,
            isGeneral: isGeneral ?? !purchaseId // if no purchase, mark as general
          }
        });
        return createdExpense;
      } else {
        // Create Expense Record
        const createdExpense = await tx.expense.create({
          data: {
            description,
            amount: Number(amount),
            category,
            accountId,
            expenseDate,
            paymentMethod,
            referenceNo,
            vendor,
            purchaseId,
            batch,
            isGeneral: isGeneral ?? !purchaseId // if no purchase, mark as general
          }
        });
        const UtilitiesAccount = await AccountController.findAccount({
          tx,
          name: Account_Utilities.name,
          type: Account_Utilities.acc_type
        });
        //  Create Journal Entry
        await JournalService.createJournalEntry(tx, {
          transactionId: createdExpense.id,
          description: `Expense - ${description}`,
          lines: [
            {
              account_id: accountId,
              credit: amount
            },
            {
              account_id: UtilitiesAccount.account_id,
              debit: amount
            }
          ]
        });

        return createdExpense;
      }
    });

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, expense, 'Expense created successfully'));
  }

  // public async createExpense(req: Request, res: Response): Promise<void> {
  //   const { purchaseId, } = req.body;
  //   const data = req.body

  //   const expense = await prisma.$transaction(async (tx) => {
  //     // If tied to a purchase, validate purchase existence
  //     if (purchaseId) {
  //       const purchase = await tx.purchase.findUnique({ where: { purchase_id: purchaseId } });
  //       if (!purchase) throw new NotFoundError('Purchase not found');
  //     }
  //     const journalEntry = await JournalService.createJournalEntry(tx, {
  //       transactionId: 'purchase_payment', description: 'purchase payment', lines: [{
  //         account_id: data.account_id!,
  //         credit: data.
  //         account_id: inventoryAccount.account_id,
  //         debit: data.total_purchase_cost,
  //       }]
  //     });
  //     const expense = await prisma.expense.create({ data: req.body });
  //   })

  //   res
  //     .status(StatusCodes.CREATED)
  //     .send(GetSuccessMessage(StatusCodes.CREATED, expense, 'Expense created successfully'));
  // }

  /**
   * Update expense
   */

  public async updateExpense(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { field, value } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense not found');

    await prisma.$transaction(async (tx) => {
      switch (field) {
        //  1. STATUS CHANGE
        case 'status':
          return await ExpensesController.handleStatusChange(tx, existing, field);

        //  2. AMOUNT CHANGE
        case 'amount':
          return await ExpensesController.handleAmountChange(tx, existing, Number(value));

        //  3. ACCOUNT CHANGE
        case 'accountId':
          return await ExpensesController.handleAccountChange(tx, existing, value);

        //  4. SIMPLE FIELDS
        case 'description':
        case 'category':
        case 'expenseDate':
        case 'paymentMethod':
        case 'referenceNo':
        case 'vendor':
        case 'batch':
        case 'isGeneral':
          return await tx.expense.update({
            where: { id },
            data: { [field]: value }
          });

        //  5. UNKNOWN FIELD
        default:
          throw new BadRequestError('Invalid field for update');
      }

      console.log('category section');
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, null, `${field} updated successfully`));
  }

  private static async handleStatusChange(tx: PrismaTransactionalClient, expense: expenseType, newStatus: 'PENDING' | 'PAID') {
    const { status: oldStatus } = expense;
    // const BankAccount = await AccountController.findAccount({ tx, name: Account_Bank.name, type: Account_Bank.acc_type });

    if (oldStatus === 'PENDING' && newStatus === 'PAID') {
      // await ExpensesController.createJournalEntry(tx, expense, bankAccountId);
      // await ExpenseController.updateBalances(tx, accountId, bankAccountId, amount, 'debit-expense');
      const UtilitiesAccount = await AccountController.findAccount({ tx, name: Account_Utilities.name, type: Account_Utilities.acc_type });
      //  Create Journal Entry
      await JournalService.createJournalEntry(tx, {
        transactionId: expense.id,
        description: `updating Expense from pending to paid - ${expense.description}`,
        lines: [
          {
            account_id: expense.accountId,
            credit: new Decimal(expense.amount)
          },
          {
            account_id: UtilitiesAccount.account_id,
            debit: new Decimal(expense.amount)
          }
        ]
      });
    } else if (oldStatus === 'PAID' && newStatus === 'PENDING') {
      // await ExpenseController.createReversalEntry(tx, expense, bankAccountId);
      // await ExpenseController.updateBalances(tx, accountId, bankAccountId, amount, 'reverse-expense');

      const UtilitiesAccount = await AccountController.findAccount({ tx, name: Account_Utilities.name, type: Account_Utilities.acc_type });

      //  Create Journal Entry
      await JournalService.createJournalEntry(tx, {
        transactionId: expense.id,
        description: `updating Expense  from paid to pending- ${expense.description}`,
        lines: [
          {
            account_id: expense.accountId,
            credit: new Decimal(expense.amount)
          },
          {
            account_id: UtilitiesAccount.account_id,
            debit: new Decimal(expense.amount)
          }
        ]
      });
    } else {
      throw new BadRequestError('Invalid status transition');
    }

    return tx.expense.update({
      where: { id: expense.id },
      data: { status: newStatus }
    });
  }

  private static async handleAmountChange(tx: PrismaTransactionalClient, expense: expenseType, newAmount: number) {
    const { amount: oldAmount, status } = expense;
    const delta = Number(newAmount) - Number(oldAmount);

    if (status === 'PAID') {
      const UtilitiesAccount = await AccountController.findAccount({ tx, name: Account_Utilities.name, type: Account_Utilities.acc_type });
      //  Create Journal Entry
      await JournalService.createJournalEntry(tx, {
        transactionId: expense.id,
        description: `updating Expense from pending to paid - ${expense.description}`,
        lines: [
          {
            account_id: expense.accountId,
            credit: new Decimal(delta)
          },
          {
            account_id: UtilitiesAccount.account_id,
            debit: new Decimal(delta)
          }
        ]
      });

      // await ExpensesController.updateBalances(tx, accountId, bankAccountId, delta, 'delta-adjust');
    }

    return tx.expense.update({
      where: { id: expense.id },
      data: { amount: Number(newAmount) }
    });
  }

  private static async handleAccountChange(tx: PrismaTransactionalClient, expense: expenseType, newAccountId: string) {
    const { status } = expense;

    if (status === 'PAID') {
      // await ExpensesController.updateBalances(tx, oldAccountId, bankAccountId, amount, 'reverse-expense');
      // await ExpensesController.updateBalances(tx, newAccountId, bankAccountId, amount, 'debit-expense');
      const UtilitiesAccount = await AccountController.findAccount({ tx, name: Account_Utilities.name, type: Account_Utilities.acc_type });

      //  Create Journal Entry
      await JournalService.createJournalEntry(tx, {
        transactionId: expense.id,
        description: `updating Expense accountid- ${expense.description}`,
        lines: [
          {
            account_id: UtilitiesAccount.account_id,
            credit: new Decimal(expense.amount)
          },
          {
            account_id: expense.accountId,
            debit: new Decimal(expense.amount)
          }
        ]
      });

      await JournalService.createJournalEntry(tx, {
        transactionId: expense.id,
        description: `updating Expense accountid- ${expense.description}`,
        lines: [
          {
            account_id: newAccountId,
            credit: new Decimal(expense.amount)
          },
          {
            account_id: UtilitiesAccount.account_id,
            debit: new Decimal(expense.amount)
          }
        ]
      });

      return tx.expense.update({
        where: { id: expense.id },
        data: { accountId: newAccountId }
      });
    }
  }

  // @joiValidation(expenseUpdateSchema)
  // public async updateExpense(req: Request, res: Response): Promise<void> {
  //   const { id } = req.params;

  //   const existing = await prisma.expense.findUnique({ where: { id } });
  //   if (!existing) throw new NotFoundError('Expense not found');

  //   const updated = await prisma.expense.update({ where: { id }, data: req.body });

  //   res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updated, 'Expense updated successfully'));
  // }

  /**
   * Delete expense
   */
  public async deleteExpense(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense not found');

    // weh have to first adjust the journal entry before deleting the expense  and the accounts too

    // const journalEntry = await prisma.journalEntry.findFirst({

    await prisma.expense.delete({ where: { id } });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, null, 'Expense deleted successfully'));
  }
}
