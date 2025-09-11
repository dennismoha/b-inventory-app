// routes/productUnitRoutes.ts
import express, { Router } from 'express';
import { ProductUnitsController } from '@src/features/products/controller/products-units-controller';

class ProductUnitsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/product-units', ProductUnitsController.prototype.fetchProductUnits);
    this.router.post('/product-units', ProductUnitsController.prototype.createProductUnit);
    this.router.put('/product-units/:product_unit_id', ProductUnitsController.prototype.updateProductUnit);
    this.router.delete('/product-units/:product_unit_id', ProductUnitsController.prototype.deleteProductUnit);

    return this.router;
  }
}

export const productUnitsRoutes = new ProductUnitsRoutes();
