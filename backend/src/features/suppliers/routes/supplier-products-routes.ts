// routes/supplierProductRoutes.ts
import express, { Router } from 'express';
import { SupplierProductsController } from '@src/features/suppliers/controller/supplier-products-controller';

class SupplierProductsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/supplier-products', SupplierProductsController.prototype.fetchSupplierProducts);
    this.router.post('/supplier-products', SupplierProductsController.prototype.createSupplierProduct);
    this.router.put('/supplier-products/:supplier_products_id', SupplierProductsController.prototype.updateSupplierProduct);
    this.router.delete('/supplier-products/:supplier_products_id', SupplierProductsController.prototype.deleteSupplierProduct);

    return this.router;
  }
}

export const supplierProductsRoutes = new SupplierProductsRoutes();
