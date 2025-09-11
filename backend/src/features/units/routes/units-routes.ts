// routes/unitRoutes.ts
import express, { Router } from 'express';
import { UnitsController } from '@src/features/units/controller/units-controller';

class UnitsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/units', UnitsController.prototype.fetchUnits);
    this.router.post('/units', UnitsController.prototype.createUnit);
    this.router.put('/units/:unit_id', UnitsController.prototype.updateUnit);
    this.router.delete('/units/:unit_id', UnitsController.prototype.deleteUnit);

    return this.router;
  }
}

export const unitsRoutes = new UnitsRoutes();
