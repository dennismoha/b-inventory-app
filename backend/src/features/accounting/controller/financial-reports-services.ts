import prisma from '@src/shared/prisma/prisma-client';
import { BalanceSheetResponse, CashflowStatement, ProfitAndLossResponse } from '../interfaces/financial-reports.interface';
// import { Decimal } from '@prisma/client/runtime/library';

export class FinancialReportsService {
  /**
   * Profit & Loss Statement
   */
  static async getProfitAndLoss(startDate: Date, endDate: Date) {
    const accounts = await prisma.account.findMany({
      include: {
        journalLines: {
          where: {
            journal: { date: { gte: startDate, lte: endDate } }
          }
        }
      }
    });

    const incomeAccounts = accounts.filter((a) => a.type === 'INCOME');
    const expenseAccounts = accounts.filter((a) => a.type === 'EXPENSE');

    const totalIncome = incomeAccounts.reduce((sum, acc) => {
      return sum + acc.journalLines.reduce((s, l) => s + Number(l.credit) - Number(l.debit), 0);
    }, 0);

    const totalExpenses = expenseAccounts.reduce((sum, acc) => {
      return sum + acc.journalLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
    }, 0);

    const data: ProfitAndLossResponse = {
      incomeAccounts,
      expenseAccounts,
      totals: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
      }
    };

    console.log('data is ', data);
    return data;

    // return {
    //   incomeAccounts,
    //   expenseAccounts,
    //   totals: {
    //     totalIncome,
    //     totalExpenses,
    //     netProfit: totalIncome - totalExpenses,
    //   },
    // };
  }

  /**
   * Balance Sheet
   */
  static async getBalanceSheet(asOfDate: Date) {
    const accounts = await prisma.account.findMany({
      include: {
        journalLines: {
          where: {
            journal: { date: { lte: asOfDate } }
          }
        }
      }
    });

    const assets = accounts.filter((a) => a.type === 'ASSET');
    const liabilities = accounts.filter((a) => a.type === 'LIABILITY');
    const equity = accounts.filter((a) => a.type === 'EQUITY');

    const calcBalance = (acc: (typeof accounts)[number]) =>
      acc.journalLines.reduce((sum, l) => sum + (Number(l.debit) - Number(l.credit)), 0);

    const totalAssets = assets.reduce((sum, acc) => sum + calcBalance(acc), 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + calcBalance(acc), 0);
    const totalEquity = equity.reduce((sum, acc) => sum + calcBalance(acc), 0);

    const data: BalanceSheetResponse = {
      assets,
      liabilities,
      equity,
      totals: {
        totalAssets,
        totalLiabilities,
        totalEquity
      }
    };

    console.log('data is ', data);

    return data;

    // return {
    //   assets,
    //   liabilities,
    //   equity,
    //   totals: {
    //     totalAssets,
    //     totalLiabilities,
    //     totalEquity,
    //   },
    // };
  }

  /**
   * Cashflow Statement
   */
  // static async getCashflowStatement(startDate: Date, endDate: Date) {
  //   const lines = await prisma.journalLine.findMany({
  //     where: {
  //       journal: { date: { gte: startDate, lte: endDate } },
  //       account: {
  //         name: { in: ['CASH', 'BANK'] }, // tweak this if you have account_number rules
  //       },
  //     },
  //     include: { account: true, journal: true },
  //   });

  //   let inflow = 0;
  //   let outflow = 0;

  //   for (const line of lines) {
  //     if (line.debit.gt(0)) inflow += Number(line.debit);
  //     if (line.credit.gt(0)) outflow += Number(line.credit);
  //   }

  //   return {
  //     inflow,
  //     outflow,
  //     netCashflow: inflow - outflow,
  //     details: lines.map(l => ({
  //       date: l.journal.date,
  //       account: l.account.name,
  //       debit: Number(l.debit),
  //       credit: Number(l.credit),
  //     })),
  //   };
  // }
  static async getCashflowStatement(startDate: Date, endDate: Date) {
    // Fetch all journal lines for cash/bank accounts in date range
    const lines = await prisma.journalLine.findMany({
      where: {
        journal: { date: { gte: startDate, lte: endDate } },
        account: {
          type: 'ASSET',
          name: { in: ['Cash', 'Bank'] } // Only includes Cash and Bank accounts, since cashflow reports deal with actual movement of cash.
        }
      },
      include: { account: true, journal: true }
    });

    // Buckets
    let operatingInflow = 0;
    let operatingOutflow = 0;
    let investingInflow = 0;
    let investingOutflow = 0;
    let financingInflow = 0;
    let financingOutflow = 0;

    // Map journal lines to categories based on contra account
    for (const line of lines) {
      /**
       * Each journal has at least 2 sides (double-entry).

        For every Cash/Bank line, we fetch the contra entries (other lines in the same journal).

          The contra account type tells us what the cash was for.
       * 
       */
      const contraLines = await prisma.journalLine.findMany({
        where: { entry_id: line.entry_id, NOT: { line_id: line.line_id } },
        include: { account: true }
      });
      /***
       * Classify by contra account type
       * Operating: Cash ↔ Income/Expense accounts.
            Investing: Cash ↔ other Assets (buying/selling equipment, inventory investments).

            Financing: Cash ↔ Liabilities or Equity (loans, shareholder capital, repayments).

            Debit = inflow (cash coming in), Credit = outflow (cash going out).
       * 
       * 
       */

      for (const contra of contraLines) {
        const accType = contra.account.type;

        if (accType === 'INCOME' || accType === 'EXPENSE') {
          // Operating
          if (line.debit.gt(0)) operatingInflow += Number(line.debit);
          if (line.credit.gt(0)) operatingOutflow += Number(line.credit);
        } else if (accType === 'ASSET' && contra.account.name !== 'Cash' && contra.account.name !== 'Bank') {
          // Investing (non-cash assets)
          if (line.debit.gt(0)) investingOutflow += Number(line.debit);
          if (line.credit.gt(0)) investingInflow += Number(line.credit);
        } else if (accType === 'LIABILITY' || accType === 'EQUITY') {
          // Financing
          if (line.debit.gt(0)) financingOutflow += Number(line.debit);
          if (line.credit.gt(0)) financingInflow += Number(line.credit);
        }
      }
    }

    const data: CashflowStatement = {
      operating: {
        inflow: operatingInflow,
        outflow: operatingOutflow,
        net: operatingInflow - operatingOutflow
      },
      investing: {
        inflow: investingInflow,
        outflow: investingOutflow,
        net: investingInflow - investingOutflow
      },
      financing: {
        inflow: financingInflow,
        outflow: financingOutflow,
        net: financingInflow - financingOutflow
      },
      totals: {
        netCashflow: operatingInflow - operatingOutflow + (investingInflow - investingOutflow) + (financingInflow - financingOutflow)
      }
    };

    return data;
    // return {
    //   operating: {
    //     inflow: operatingInflow,
    //     outflow: operatingOutflow,
    //     net: operatingInflow - operatingOutflow,
    //   },
    //   investing: {
    //     inflow: investingInflow,
    //     outflow: investingOutflow,
    //     net: investingInflow - investingOutflow,
    //   },
    //   financing: {
    //     inflow: financingInflow,
    //     outflow: financingOutflow,
    //     net: financingInflow - financingOutflow,
    //   },
    //   totals: {
    //     netCashflow:
    //       (operatingInflow - operatingOutflow) +
    //       (investingInflow - investingOutflow) +
    //       (financingInflow - financingOutflow),
    //   },
    // };
  }

  static async getTrialBalanceStatement(startDate: Date, endDate: Date) {
    const lines = await prisma.journalLine.findMany({
      where: {
        journal: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        account: true
      }
    });

    console.log('the lines are ', lines);

    // Aggregate debit/credit per account
    const trialBalanceMap = new Map<string, { account_number: string; name: string; type: string; debit: number; credit: number }>();

    for (const line of lines) {
      const key = line.account_id;

      if (!trialBalanceMap.has(key)) {
        trialBalanceMap.set(key, {
          account_number: line.account.account_number,
          name: line.account.name,
          type: line.account.type,
          debit: 0,
          credit: 0
        });
      }

      const acc = trialBalanceMap.get(key)!;
      acc.debit += Number(line.debit);
      acc.credit += Number(line.credit);
    }
    console.log('trial balance is ', trialBalanceMap);
    return Array.from(trialBalanceMap.values());
  }
}
