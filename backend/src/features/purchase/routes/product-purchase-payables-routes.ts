import express, { Router } from 'express';
// import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { PurchasePayablesController } from '../controller/purchase-payables-controller';

class PurchasePayablesRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Create new purchase
    this.router.get('/purchase-payables', authMiddleware.checkAuthentication, PurchasePayablesController.prototype.getAll);

    return this.router;
  }
}

export const purchasePayablesRoutes = new PurchasePayablesRoutes();
