import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { NotFoundError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { expenseCreateSchema, expenseUpdateSchema } from '@src/features/expenses/schema/expenses-schema';
import { Expense } from '@src/features/expenses/interface/expenses.interface';
import { JournalService } from '@src/features/accounting/controller/journals-controller';
import { Decimal } from '@prisma/client/runtime/library';

export class ExpensesController {
  /**
   * Fetch all expenses
   */
  public async fetchExpenses(req: Request, res: Response): Promise<void> {
    const expenses: Expense[] = await prisma.expense.findMany({
      include: { purchase: true }
    });

    res
      .status(StatusCodes.OK)
      .send(GetSuccessMessage(StatusCodes.OK, expenses, 'Expenses fetched successfully'));
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

    res
      .status(StatusCodes.OK)
      .send(GetSuccessMessage(StatusCodes.OK, expense, 'Expense fetched successfully'));
  }

  /**
   * Create new expense
   */
  @joiValidation(expenseCreateSchema)
  public async createExpense(req: Request, res: Response): Promise<void> {
    const {
      purchaseId,
      description,
      amount,
      category,
      accountId,
      batch,
      isGeneral,
    }: {
      purchaseId?: string;
      description: string;
      amount: Decimal;
      category: string;
      accountId: string;
      batch?: string;
      isGeneral?: boolean;
    } = req.body;

    const expense = await prisma.$transaction(async (tx) => {
      //  If tied to a purchase, validate purchase existence
      if (purchaseId) {
        const purchase = await tx.purchase.findUnique({
          where: { purchase_id: purchaseId },
        });
        if (!purchase) {
          throw new NotFoundError('Purchase not found');
        }
      }

      // Create Expense Record
      const createdExpense = await tx.expense.create({
        data: {
          description,
          amount: Number(amount),
          category,
          accountId,
          purchaseId,
          batch,
          isGeneral: isGeneral ?? !purchaseId, // if no purchase, mark as general
        },
      });

      
      //  Create Journal Entry
      await JournalService.createJournalEntry(tx, {
        transactionId: createdExpense.id,
        description: `Expense - ${description}`,
        lines: [
          {
            account_id: accountId,
            credit: amount,
          },
          {
            account_id: accountId,
            debit: amount,
          },
        ],
      });


      return createdExpense;
    });

    res.status(StatusCodes.CREATED).send(
      GetSuccessMessage(
        StatusCodes.CREATED,
        expense,
        'Expense created successfully'
      )
    );
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
  @joiValidation(expenseUpdateSchema)
  public async updateExpense(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense not found');

    const updated = await prisma.expense.update({ where: { id }, data: req.body });

    res
      .status(StatusCodes.OK)
      .send(GetSuccessMessage(StatusCodes.OK, updated, 'Expense updated successfully'));
  }

  /**
   * Delete expense
   */
  public async deleteExpense(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense not found');

    await prisma.expense.delete({ where: { id } });

    res
      .status(StatusCodes.OK)
      .send(GetSuccessMessage(StatusCodes.OK, null, 'Expense deleted successfully'));
  }
}
