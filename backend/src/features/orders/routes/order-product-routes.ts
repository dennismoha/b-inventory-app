// routes/orderProductsRoutes.ts
import express, { Router } from 'express';
import { OrderProductsController } from '@src/features/orders/controller/order-products-controller';

class OrderProductsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/order-products/:orderId', OrderProductsController.prototype.fetchOrderProducts);
    this.router.post('/order-products', OrderProductsController.prototype.createOrderProduct);
    this.router.put('/order-products/:orderProductsId', OrderProductsController.prototype.updateOrderProduct);
    this.router.delete('/order-products/:orderProductsId', OrderProductsController.prototype.deleteOrderProduct);

    return this.router;
  }
}

export const orderProductsRoutes = new OrderProductsRoutes();
