// src/features/accounting/routes/reportRoutes.ts

import express, { Router } from 'express';
import { ReportsController } from '@src/features/accounting/controller/financial-reports-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
// import { createValidatePosSessionMiddleware } from '@src/shared/globals/helpers/pos_session_validator';

class ReportRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Profit & Loss
    this.router.get(
      '/reports/profit-loss',
      authMiddleware.verifyUser,
      // createValidatePosSessionMiddleware(),
      ReportsController.prototype.profitAndLoss
    );

    // Balance Sheet
    this.router.get(
      '/reports/balance-sheet',
      authMiddleware.verifyUser,
      // createValidatePosSessionMiddleware(),
      ReportsController.prototype.balanceSheet
    );

    // Cashflow Statement
    this.router.get(
      '/reports/cashflow',
      authMiddleware.verifyUser,
      // createValidatePosSessionMiddleware(),
      ReportsController.prototype.cashflow
    );

    // get trial balance
    this.router.get(
      '/reports/trialbalance',
      authMiddleware.verifyUser,
      // createValidatePosSessionMiddleware(),
      ReportsController.prototype.getTrialBalance
    );

    return this.router;
  }
}

export const reportRoutes = new ReportRoutes();
