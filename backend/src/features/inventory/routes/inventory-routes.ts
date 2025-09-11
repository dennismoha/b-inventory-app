// routes/inventoryRoutes.ts
import express, { Router } from 'express';
import { InventoryController } from '@src/features/inventory/controller/inventory-controller';

class InventoryRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/inventory', InventoryController.prototype.fetchInventory);
    this.router.post('/inventory', InventoryController.prototype.createInventory);
    // this.router.put('/inventory/:inventoryId', InventoryController.prototype.updateInventory);
    // this.router.delete('/inventory/:inventoryId', InventoryController.prototype.deleteInventory);
    // this.router.get('/inventory/low-stock', InventoryController.prototype.fetchLowStockItems);
    // this.router.put('/inventory/restock/:inventoryId', InventoryController.prototype.restockInventory);
    // this.router.get('/inventory/restock', InventoryController.prototype.getAllRestocks);
    // this.router.get('/inventory/inventory-sales-tracking', InventoryController.prototype.getAllSalesTracking);
    // this.router.get(
    //   '/inventory/inventory-sales-tracking/stock-comparison',
    //   InventoryController.prototype.getSalesTrackingByStockComparison
    // );
    // this.router.get('/inventory/inventory-sales-tracking/zero-stock', InventoryController.prototype.getSalesTrackingByZeroStock);
    return this.router;
  }
}

export const inventoryRoutes = new InventoryRoutes();
