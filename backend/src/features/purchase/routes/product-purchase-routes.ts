// src/features/purchase/routes/purchase-routes.ts
import express, { Router } from 'express';

import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { PurchaseController } from '../controller/purchase-controller';

class PurchaseRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Create new purchase
    this.router.post('/purchase', authMiddleware.checkAuthentication, PurchaseController.prototype.create);

    // // Get all purchases
    this.router.get('/purchase', authMiddleware.checkAuthentication, PurchaseController.prototype.getAll);
    this.router.put('/purchase/:id', authMiddleware.checkAuthentication, PurchaseController.prototype.editPurchase);

    // // Get single purchase by ID
    // this.router.get(
    //   '/purchase/:id',
    //   authMiddleware.checkAuthentication,
    //   PurchaseController.prototype.getById
    // );

    // update purchase payment type
    this.router.patch('/purchase/payment-type/', authMiddleware.checkAuthentication, PurchaseController.prototype.updatePaymentType);
    // // Update purchase by ID
    // this.router.put(
    //   '/purchase/',
    //   authMiddleware.checkAuthentication,
    //   PurchaseController.prototype.editPurchase
    // );

    // // Delete purchase by ID
    this.router.delete('/purchase/', authMiddleware.checkAuthentication, PurchaseController.prototype.deletePurchase);

    return this.router;
  }
}

export const purchaseRoutes: PurchaseRoutes = new PurchaseRoutes();
