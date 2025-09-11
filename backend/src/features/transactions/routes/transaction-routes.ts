import express, { Router } from 'express';
import { TransactionsController } from '@src/features/transactions/controller/';

class TransactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // this.router.get('/transactions/:transactionId', TransactionsController.prototype.fetchTransactions);
    // this.router.get('/transactions/customer/:customerId', TransactionsController.prototype.fetchTransactionsByCustomer);
    this.router.post('/transactions', TransactionsController.prototype.createTransaction);
    // this.router.put('/transactions/:transactionId', TransactionsController.prototype.updateTransaction);
    // this.router.delete('/transactions/:transactionId', TransactionsController.prototype.deleteTransaction);
    this.router.get('/transactions', TransactionsController.prototype.fetchTransactions);

    return this.router;
  }
}

export const transactionRoutes = new TransactionRoutes();
