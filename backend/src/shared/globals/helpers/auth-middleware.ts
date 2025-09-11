import { config } from '@src/config';
import { AuthPayload } from '@src/features/auth/interfaces/auth.interface';
import { NotAuthorizedError } from '@src/shared/globals/helpers/error-handler';
import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

export class AuthMiddleware {
  // verify the user and check if token is valid

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    // console.log('req.session', req);

    // console.log('req.session 222', req.cookies);
    // console.log('req session next cookies ', req.cookies.session.jwt);
    // const sessionToken = req.cookies['next-auth.session-token'];
    // console.log('session token is ', sessionToken);
    // console.log('jwt token is ', req.session?.jwt);
    // console.log('req.session?.jwt', req.session?.jwt);
    if (!req.session?.jwt || !req.cookies?.session) {
      // console.log('req.url', req.url);
      req.session = null;
      throw new NotAuthorizedError(' Token invalid');
    }

    try {
      // console.log('in this try catch');
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_SECRET) as AuthPayload;
      // console.log('reached here payload', payload);
      req.currentUser = payload;
    } catch (error) {
      req.session = null;
      throw new NotAuthorizedError(`token invalid. please login again ${JSON.stringify(error)}`);
    }
    next();
  }

  // check if user is authenticated

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('You are not authenticated');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
