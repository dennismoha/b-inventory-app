// routes/orderRoutes.ts
import express, { Router } from 'express';
import { OrderController } from '@src/features/orders/controller/orders-controller';

class OrdersRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/orders', OrderController.prototype.fetchOrders);
    this.router.post('/orders', OrderController.prototype.createOrder);
    this.router.put('/orders/:orderId', OrderController.prototype.updateOrder);
    this.router.delete('/orders/:orderId', OrderController.prototype.deleteOrder);

    return this.router;
  }
}

export const ordersRoutes = new OrdersRoutes();
