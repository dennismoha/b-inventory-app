// src/features/pos/routes/posSessionRoutes.ts

import express, { Router } from 'express';
import { PosSessionController } from '@src/features/pos/controller/pos-session-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';
import { createValidatePosSessionMiddleware } from '@src/shared/globals/helpers/pos_session_validator';
class PosSessionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Open POS session
    this.router.post('/pos/session/open', authMiddleware.verifyUser, PosSessionController.prototype.openSession);

    // Close POS session
    this.router.post(
      '/pos/session/close',
      authMiddleware.verifyUser,
      createValidatePosSessionMiddleware(),
      PosSessionController.prototype.closeSession
    );

    // check if possession_id is active
    this.router.get('/pos/session/fetch', authMiddleware.verifyUser, PosSessionController.prototype.checkPosSession);

    return this.router;
  }
}

export const posSessionRoutes = new PosSessionRoutes();
