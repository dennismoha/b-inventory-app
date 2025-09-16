// src/features/accounts/routes/accountRoutes.ts

import express, { Router } from 'express';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { createValidatePosSessionMiddleware } from '@src/shared/globals/helpers/pos_session_validator';

class AccountRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Create new account
    this.router.post(
      '/accounts',
      authMiddleware.verifyUser,

      AccountController.prototype.createAccount
    );

    this.router.get('/accounts/trial-balances', authMiddleware.verifyUser, AccountController.prototype.getTrialBalance);

    // Get all accounts
    this.router.get('/accounts', authMiddleware.verifyUser, AccountController.prototype.getAccounts);

    // top up account
    this.router.put(
      '/accounts/topup/:accountId',
      authMiddleware.verifyUser,
      createValidatePosSessionMiddleware(),
      AccountController.prototype.topUp
    );

    // Get account by ID
    this.router.get('/accounts/:accountId', authMiddleware.verifyUser, AccountController.prototype.getAccountById);

    // Update account status
    this.router.put(
      '/accounts/status/:accountId',
      authMiddleware.verifyUser,

      AccountController.prototype.updateStatus
    );
    // Update account
    this.router.put(
      '/accounts/:accountId',
      authMiddleware.verifyUser,

      AccountController.prototype.updateAccount
    );

    // Soft delete account
    this.router.delete('/accounts/:accountId', authMiddleware.verifyUser, AccountController.prototype.deleteAccount);

    return this.router;
  }
}

export const accountRoutes = new AccountRoutes();
