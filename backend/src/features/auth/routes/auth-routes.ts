import express, { Router } from 'express';
import { Signup } from '@src/features/auth/controller/signup';
import { Login } from '@src/features/auth/controller/signin';
import { SignOut } from '@src/features/auth/controller/signout';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', Signup.prototype.createUsers);
    this.router.post('/login', Login.prototype.login);

    return this.router;
  }
  public signoutRoute(): Router {
    this.router.get('/logout', authMiddleware.verifyUser, SignOut.prototype.update);

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
