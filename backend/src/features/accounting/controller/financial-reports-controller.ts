import { Request, Response } from 'express';
import { FinancialReportsService } from '@src/features/accounting/controller/financial-reports-services';
import {
  BalanceSheetResponse,
  CashflowStatement,
  ProfitAndLossResponse
} from '@src/features/accounting/interfaces/financial-reports.interface';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';

export class ReportsController {
  public async profitAndLoss(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const result: ProfitAndLossResponse = await FinancialReportsService.getProfitAndLoss(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, result, 'profit and loss'));
    //res.json(result);
  }

  public async balanceSheet(req: Request, res: Response) {
    const { asOfDate } = req.query;
    const result: BalanceSheetResponse = await FinancialReportsService.getBalanceSheet(new Date(asOfDate as string));
    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, result, 'balance sheet'));
    // res.json(result);
  }

  public async cashflow(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const result: CashflowStatement = await FinancialReportsService.getCashflowStatement(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, result, 'cashflow'));
  }

  public async getTrialBalance(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    const result = await FinancialReportsService.getTrialBalanceStatement(new Date(startDate as string), new Date(endDate as string));

    res.json(result);
  }
}
