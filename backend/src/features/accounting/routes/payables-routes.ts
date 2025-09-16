import express, { Router } from 'express';
import { PayablesController } from '@src/features/accounting/controller/payables-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class PayablesRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Create new payable entry
    this.router.post('/payables', authMiddleware.verifyUser, PayablesController.prototype.createPayable);

    // Get all payables
    this.router.get('/payables', authMiddleware.verifyUser, PayablesController.prototype.getPayables);

    // Get a single payable by ID
    this.router.get('/payables/:id', authMiddleware.verifyUser, PayablesController.prototype.getPayableById);

    // Update a payable by ID
    // this.router.put(
    //     '/payables/:id',
    //     authMiddleware.verifyUser,
    //     PayablesController.prototype.updatePayable
    // );

    // Delete a payable by ID
    this.router.delete('/payables/:id', authMiddleware.verifyUser, PayablesController.prototype.deletePayable);

    return this.router;
  }
}

// export { PayablesRoutes };

export const payablesRoutes = new PayablesRoutes();
