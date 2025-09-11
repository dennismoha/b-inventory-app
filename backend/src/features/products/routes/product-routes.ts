// routes/productRoutes.ts
import express, { Router } from 'express';
import { ProductsController } from '@src/features/products/controller/products-controller';

class ProductsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/products', ProductsController.prototype.fetchProducts);
    this.router.post('/products', ProductsController.prototype.createProduct);
    this.router.put('/products/:product_id', ProductsController.prototype.updateProduct);
    this.router.delete('/products/:product_id', ProductsController.prototype.deleteProduct);

    return this.router;
  }
}

export const productsRoutes = new ProductsRoutes();
