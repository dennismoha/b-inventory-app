import express, { Router } from 'express';
import { CashBookLedgerController } from '@src/features/accounting/controller/cashbook-ledger-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class CashbookLedgerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Create new cashbook ledger entry
    // this.router.post(
    //     '/cashbook-ledger',
    //     authMiddleware.verifyUser,
    //     CashBookLedgerController.prototype.createCashBookLedger
    // );

    // Get all cashbook ledger entries
    this.router.get('/cashbook-ledger', authMiddleware.verifyUser, CashBookLedgerController.prototype.getCashBookLedgers);

    // Get single cashbook ledger entry by ID
    // this.router.get(
    //     '/cashbook-ledger/:id',
    //     authMiddleware.verifyUser,
    //     CashBookLedgerController.prototype.getCashBookLedgerById
    // );

    // // Update cashbook ledger entry by ID
    // this.router.put(
    //     '/cashbook-ledger/:id',
    //     authMiddleware.verifyUser,
    //     CashBookLedgerController.prototype.createCashBookLedger
    // );

    // // Delete cashbook ledger entry by ID
    // this.router.delete(
    //     '/cashbook-ledger/:id',
    //     authMiddleware.verifyUser,
    //     CashBookLedgerController.prototype.deleteCashBookLedger
    // );

    return this.router;
  }
}

export const cashbookLedgerRoutes = new CashbookLedgerRoutes();
