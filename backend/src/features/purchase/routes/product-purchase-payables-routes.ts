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
    this.router.get(
      '/purchase-payables/:id',
      authMiddleware.checkAuthentication,
      PurchasePayablesController.prototype.getPartialPurchasePayablesById
    );
    // this.router.put(
    //   '/purchase-payables/purchase/:id',
    //   authMiddleware.checkAuthentication,
    //   PurchasePayablesController.prototype.createPartialPurchasePayableById
    // );

    this.router.put(
      '/purchase-payables/payable/:id',
      authMiddleware.checkAuthentication,
      PurchasePayablesController.prototype.BatchPurchasePayablesPayment
    );

    return this.router;
  }
}

export const purchasePayablesRoutes = new PurchasePayablesRoutes();
