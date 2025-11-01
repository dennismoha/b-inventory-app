import express, { Router } from 'express';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { BatchInventoryController } from '../controller/purchase-batch-inventory-controller';

class BatchInventoryRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Example: Get all batch inventories
    this.router.get('/batch-inventories', authMiddleware.checkAuthentication, BatchInventoryController.prototype.getAll);
    this.router.patch('/batch-inventories/:id/status', authMiddleware.checkAuthentication, BatchInventoryController.prototype.toggleStatus);

    return this.router;
  }
}

export const batchInventoryRoutes = new BatchInventoryRoutes();
