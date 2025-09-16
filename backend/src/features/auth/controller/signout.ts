import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
export class SignOut {
  public async update(req: Request, res: Response): Promise<void> {
    console.log('SignOut request received:::::', req.currentUser);

    if (!req.currentUser) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const User = await prisma.user.findUnique({
      where: { email: req.currentUser.email }
    });

    if (!User) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not found' });
      return;
    }
    // Log the user out by clearing the session

    console.log('User found:', User);

    const loggout = await prisma.userLoginLog.updateMany({
      where: {
        userId: User.user_id, // Assuming user_id is the primary key in User model
        logoutTime: null // Only active logins
      },
      data: {
        logoutTime: new Date(),
        isLoggedIn: false // Mark as logged out
        // Explicitly track logout status
        // isLoggedOut: true // if you add this boolean field
      }
    });

    console.log('Logout log updated:', loggout);

    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' });
  }
}
