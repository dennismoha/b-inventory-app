// routes/supplierPricingRoutes.ts
import express, { Router } from 'express';
import { SupplierPricingController } from '@src/features/suppliers/controller/supplier-pricing-controller';

class SupplierPricingRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/supplier-pricing', SupplierPricingController.prototype.fetchSupplierPricing);
    this.router.post('/supplier-pricing', SupplierPricingController.prototype.createSupplierPricing);
    this.router.put('/supplier-pricing/:supplier_pricing', SupplierPricingController.prototype.updateSupplierPricing);
    this.router.delete('/supplier-pricing/:supplier_pricing', SupplierPricingController.prototype.deleteSupplierPricing);

    return this.router;
  }
}

export const supplierPricingRoutes = new SupplierPricingRoutes();
