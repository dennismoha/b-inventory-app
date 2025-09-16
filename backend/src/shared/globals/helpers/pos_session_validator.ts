import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotFoundError } from './error-handler';
import prismaClient from '@src/shared/prisma/prisma-client';

export function createValidatePosSessionMiddleware() {
  return async function ValidatePosSession(req: Request, res: Response, next: NextFunction) {
    try {
      const passedPosSessionId = Array.isArray(req.headers['pos_session'])
        ? req.headers['pos_session'][0]
        : req.headers['pos_session'] || '';

      if (!passedPosSessionId) {
        throw new BadRequestError('Missing "pos_session" header');
      }

      console.log('passssed session is ', passedPosSessionId);

      const posSession = await prismaClient.openingClosingBalance.findFirst({
        where: { pos_session_id: passedPosSessionId, status: 'PREV' },
        select: { cash_bank_ledger_id: true }
      });

      console.log(' >> pos sess ion ', posSession);

      if (!posSession) {
        throw new NotFoundError('POS session not found or not in PREV state');
      }

      req.posLedgerId = posSession.cash_bank_ledger_id;
      req.possession = passedPosSessionId;
      next();
    } catch (error) {
      next(error);
    }
  };
}
