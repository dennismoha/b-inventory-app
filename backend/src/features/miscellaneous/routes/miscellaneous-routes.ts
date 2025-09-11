// routes/miscellaneousRoutes.ts
import express, { Router } from 'express';
import { MiscellaneousController } from '@src/features/miscellaneous/controller/miscellaneous-controller';

class MiscellaneousRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/miscellaneous/:orderId', MiscellaneousController.prototype.fetchMiscellaneous);
    this.router.post('/miscellaneous', MiscellaneousController.prototype.createMiscellaneous);
    this.router.put('/miscellaneous/:orderId', MiscellaneousController.prototype.updateMiscellaneous);
    this.router.delete('/miscellaneous/:orderId', MiscellaneousController.prototype.deleteMiscellaneous);

    return this.router;
  }
}

export const miscellaneousRoutes = new MiscellaneousRoutes();
