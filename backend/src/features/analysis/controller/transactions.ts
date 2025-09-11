import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { Transaction } from '@src/features/transactions/interfaces/transaction.interface';

export class TransactionsController {
  /**
   * Fetch all transactions.
   */
  public async fetchTransactions(req: Request, res: Response): Promise<void> {
    const transactions: Transaction[] = await prisma.transaction.findMany({
      include: {
        customer: true, // If customer is provided,
        Sales: true
      }
    });
    const message = utilMessage.fetchedMessage('transactions');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, transactions, message));
  }
}
