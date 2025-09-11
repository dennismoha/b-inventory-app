import express, { Router } from 'express';
import { CustomersController } from '@src/features/customers/controller/';

class CustomerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // this.router.get('/customers/:customerId', CustomersController.prototype.fetchCustomers);
    this.router.post('/customers', CustomersController.prototype.createCustomer);
    this.router.put('/customers/:customerId', CustomersController.prototype.updateCustomer);
    this.router.delete('/customers/:customerId', CustomersController.prototype.deleteCustomer);
    this.router.get('/customers', CustomersController.prototype.fetchCustomers);

    return this.router;
  }
}

export const customerRoutes = new CustomerRoutes();
