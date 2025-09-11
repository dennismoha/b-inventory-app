// routes/productPricingRoutes.ts

import express, { Router } from 'express';
import { ProductPricingController } from '@src/features/inventory/controller/product-pricing';

class ProductPricingRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Route to fetch all product pricing records
    this.router.get('/product-pricing', ProductPricingController.prototype.fetchProductPricing);

    // Route to create a new product pricing record
    this.router.post('/product-pricing', ProductPricingController.prototype.createProductPricing);

    // Route to update an existing product pricing record by ID
    this.router.put('/product-pricing/:productPricingId', ProductPricingController.prototype.updateProductPricing);

    // Route to soft delete a product pricing record by ID
    this.router.delete('/product-pricing/:productPricingId', ProductPricingController.prototype.deleteProductPricing);

    return this.router;
  }
}

export const productPricingRoutes = new ProductPricingRoutes();
