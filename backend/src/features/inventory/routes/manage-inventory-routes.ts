import express, { Router } from 'express';
import { ProductSummaryController } from '@src/features/inventory/controller/manage-inventory-stock-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class ProductSummaryRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Fetch low stock
    this.router.get('/inventory/low-stock', authMiddleware.verifyUser, ProductSummaryController.prototype.fetchLowStock);

    // Update stock level
    this.router.put('/inventory/update-stock-level', authMiddleware.verifyUser, ProductSummaryController.prototype.updateStockLevel);

    // fetch all stock
    this.router.get('/inventory/stock', authMiddleware.verifyUser, ProductSummaryController.prototype.fetchStock);

    return this.router;
  }
}

export const productSummaryRoutes = new ProductSummaryRoutes();
