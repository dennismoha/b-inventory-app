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

    // // Get single purchase by ID
    // this.router.get(
    //   '/purchase/:id',
    //   authMiddleware.checkAuthentication,
    //   PurchaseController.prototype.getById
    // );

    // // Update purchase by ID
    // this.router.put(
    //   '/purchase/:id',
    //   authMiddleware.checkAuthentication,
    //   PurchaseController.prototype.update
    // );

    // // Delete purchase by ID
    this.router.delete('/purchase/', authMiddleware.checkAuthentication, PurchaseController.prototype.deletePurchase);

    return this.router;
  }
}

export const purchaseRoutes: PurchaseRoutes = new PurchaseRoutes();
