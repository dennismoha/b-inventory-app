// import { RoleValue } from '@src/constants';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from './error-handler';

type Role = 'user' | 'admin'; // extend this if you add more roles later

export const verifyAuthRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.currentUser?.role) {
      return res.sendStatus(401); // Unauthorized
    }

    if (allowedRoles.includes(req.currentUser.role)) {
      return next();
    }
    return res.sendStatus(403); // Forbidden
  };
};

export const verifyRoles = () => {
  console.log('verifyRoles middleware called');
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.currentUser?.role) return res.sendStatus(401);
    console.log('req.currentUser.role::::::', req.currentUser.role);
    // Check if the user has the 'admin' role
    if (req.currentUser.role !== 'admin') throw new NotAuthorizedError('You are not authorized to access this resource');
    // if (req.currentUser.role !== 'admin') return res.sendStatus(403);

    next();
  };
};

export const verifyUserRoles = () => {
  console.log('verifyRoles middleware called');
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.currentUser?.role) return res.sendStatus(401);
    console.log('req.currentUser.role::::::', req.currentUser.role);
    // Check if the user has the 'admin' role
    if (req.currentUser.role !== 'user') return res.sendStatus(403);

    next();
  };
};

export const verifyBothRoles = () => {
  console.log('verifyRoles middleware called');
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.currentUser?.role) return res.sendStatus(401);
    console.log('req.currentUser.role::::::', req.currentUser.role);
    // Check if the user has the 'admin' role
    if (req.currentUser.role === 'user' || req.currentUser.role === 'admin') {
      return next();
    }

    return res.sendStatus(403);
  };
};

// type Roles = {
//     admin: 'string';
//     user: 'string';
// }

// type AllowedRoles: Roles = ;

// export const verifyRoless = (...allowedRoles: AllowedRoles) => {
//     return  (req:Request, res:Response, next:NextFunction) => {
//         if (!req?.currentUser?.role) return res.sendStatus(401);
//         const rolesArray = [...allowedRoles];
//         const result = req.currentUser?.role.map(role => rolesArray.includes(role)).find(val => val === true);
//         if (!result) return res.sendStatus(401);
//         next();
//     };
// };

// export const verifyRoles = (...allowedRoles: RoleValue[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!req?.currentUser?.role) return res.sendStatus(401);

//         const result = req.currentUser.role
//             .map(role => allowedRoles.includes(role))
//             .some(val => val === true);

//         if (!result) return res.sendStatus(401);

//         next();
//     };
// };
