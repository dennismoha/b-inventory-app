import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client';
import { OpeningClosingBalance } from '../interfaces/opening-closing-balance.interface';
import { CashBookLedger, CashbookLedgerRecords } from '../interfaces/cashbook-ledger.interface';
// import { STATUS_CODES } from 'node:http';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Decimal } from '@prisma/client/runtime/library';

export class CashBookLedgerController {
  /**
   * Fetch all cash book ledger entries
   */
  public async getCashBookLedgers(req: Request, res: Response): Promise<Response> {
    const ledgers = await prisma.openingClosingBalance.findMany({
      include: {
        cashBookLedgers: {
          include: {
            AccountInfo: true
          }
        }
      }
    });

    const orderRecords = (sessions: OpeningClosingBalance[]) => {
      return sessions.map((session) => {
        if (!session.cashBookLedgers || session.cashBookLedgers.length === 0) {
          return { ...session, cashBookLedgers: [] };
        }

        const inflows = session.cashBookLedgers
          .filter((txn: CashBookLedger) => txn.transaction_type === 'INFLOW')
          .map((txn: CashBookLedger) => ({
            transaction_date: txn.transaction_date,
            transaction_type: txn.transaction_type,
            amount: Number(txn.amount),
            method: txn.method,
            description: txn.description,
            account_name: txn.AccountInfo!.name,
            current_balance: txn.AccountInfo!.running_balance
          }));

        const outflows = session.cashBookLedgers
          .filter((txn: CashBookLedger) => txn.transaction_type === 'OUTFLOW')
          .map((txn: CashBookLedger) => ({
            transaction_date: txn.transaction_date,
            transaction_type: txn.transaction_type,
            amount: Number(txn.amount),
            method: txn.method,
            description: txn.description,
            account_name: txn.AccountInfo!.name,
            current_balance: txn.AccountInfo!.running_balance
          }));

        const total_inflows = inflows.reduce((sum: number, txn: { amount: number }) => sum + txn.amount, 0);
        const total_outflows = outflows.reduce((sum: number, txn: { amount: number }) => sum + txn.amount, 0);
        const net_balance = total_inflows - total_outflows;

        return {
          pos_session_id: session.pos_session_id,
          opening_date: session.opening_date,
          closing_date: session.closing_date,
          status: session.status,
          opening_balance: session.opening_balance || 0,
          closing_balance: new Decimal(session.closing_balance || 0),
          total_for_accounts: new Decimal(session.total_for_accounts || 0),
          cashBookLedgers: {
            inflows,
            outflows,
            total_inflows,
            total_outflows,
            net_balance
          }
        };
      });
    };

    const data: CashbookLedgerRecords[] = orderRecords(ledgers);

    return res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, data, 'cash book records fetched successfully'));
  }

  /**
     * 
     * Now what we have to do is data transformation.
     * 
     * in the cashflow we don't need all those records
     *                     {
                            "ledger_id": "441069db-d28c-4a1a-92e7-8062324d57b4",
                            "opening_closing_balance_id": "6f964b41-6e25-4667-b3d2-6c25ef15eb04",
                            "transaction_date": "2025-08-21T06:03:19.969Z",
                            "transaction_type": "OUTFLOW",
                            "amount": "2200",
                            "method": "bank",
                            "reference_type": "PURCHASE_PAYMENT",
                            "reference_id": null,
                            "balance_after": "0",
                          
                            "created_at": "2025-08-21T06:03:19.969Z",
                            "updated_at": "2025-08-21T06:03:19.969Z",
                            "account_id": "83f09d0b-cb3a-4df2-8807-d0f9bf705b02",
                            "AccountInfo": {
                                "account_id": "83f09d0b-cb3a-4df2-8807-d0f9bf705b02",
                                "name": "family bank",
                                "account_number": "676545345",
                                "type": "bank",
                                "description": "This is my new account and am happy",
                                "balance": "3000",
                                "current_balance": "3000",
                                "deleted": false,
                                "account_status": "ACTIVE",
                                "created_at": "2025-08-19T08:26:37.764Z",
                                "updated_at": "2025-08-19T08:26:37.764Z"
                            }
     * 
     */

  /**
   * Fetch a single cash book ledger entry by ID
   */
  // public async getCashBookLedgerById(req: Request, res: Response): Promise<Response> {
  //     const { id } = req.params;
  //     const ledger = await prisma.cashBookLedger.findUnique({
  //         where: { ledger_id: id },
  //         include: {
  //             CashBookLedgers: true,
  //             openingClosingBalance: true,
  //         },
  //     });
  //     return res.status(StatusCodes.OK).json({
  //         message: 'Cash book ledger fetched successfully',
  //         data: ledger,
  //     });
  // }

  // /**
  //  * Create a new cash book ledger entry
  //  */
  // public async createCashBookLedger(req: Request, res: Response): Promise<Response> {
  //     const data = req.body;
  //     const ledger = await prisma.cashBookLedger.create({
  //         data,
  //     });
  //     return res.status(StatusCodes.CREATED).json({
  //         message: 'Cash book ledger created successfully',
  //         data: ledger,
  //     });
  // }

  // /**
  //  * Update a cash book ledger entry by ID
  //  */
  // public async updateCashBookLedger(req: Request, res: Response): Promise<Response> {
  //     const { id } = req.params;
  //     const data = req.body;
  //     const ledger = await prisma.cashBookLedger.update({
  //         where: { ledger_id: id },
  //         data,
  //     });
  //     return res.status(StatusCodes.OK).json({
  //         message: 'Cash book ledger updated successfully',
  //         data: ledger,
  //     });
  // }

  // /**
  //  * Delete a cash book ledger entry by ID
  //  */
  // public async deleteCashBookLedger(req: Request, res: Response): Promise<Response> {
  //     const { id } = req.params;
  //     await prisma.cashBookLedger.delete({
  //         where: { ledger_id: id },
  //     });
  //     return res.status(StatusCodes.OK).json({
  //         message: 'Cash book ledger deleted successfully',
  //     });
  // }
}
