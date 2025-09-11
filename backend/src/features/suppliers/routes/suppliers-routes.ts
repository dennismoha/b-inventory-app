// routes/supplierRoutes.ts
import express, { Router } from 'express';
import { SuppliersController } from '@src/features/suppliers/controller/suppliers-controller';

class SuppliersRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/suppliers', SuppliersController.prototype.fetchSuppliers);
    this.router.post('/suppliers', SuppliersController.prototype.createSupplier);
    this.router.put('/suppliers/:supplier_id', SuppliersController.prototype.updateSupplier);
    this.router.delete('/suppliers/:supplier_id', SuppliersController.prototype.deleteSupplier);

    return this.router;
  }
}

export const suppliersRoutes = new SuppliersRoutes();
