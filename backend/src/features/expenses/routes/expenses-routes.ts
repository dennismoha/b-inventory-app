import express, { Router } from 'express';
import { ExpensesController } from '@src/features/expenses/controller/expenses-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class ExpenseRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/expenses', authMiddleware.verifyUser, ExpensesController.prototype.fetchExpenses);
    this.router.get('/expenses/:id', authMiddleware.verifyUser, ExpensesController.prototype.fetchExpenseById);
    this.router.post('/expenses', authMiddleware.verifyUser, ExpensesController.prototype.createExpense);
    this.router.put('/expenses/:id', authMiddleware.verifyUser, ExpensesController.prototype.updateExpense);
    this.router.delete('/expenses/:id', authMiddleware.verifyUser, ExpensesController.prototype.deleteExpense);

    return this.router;
  }
}

export const expenseRoutes = new ExpenseRoutes();
