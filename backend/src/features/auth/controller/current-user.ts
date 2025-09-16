/*

*/

import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<Response> {
    // Check if the user is authenticated
    let isUser = false;
    let token = null;
    let user = null;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.currentUser?.email // Assuming req.currentUser is set by a middleware after authentication
      }
    });
    if (existingUser) {
      isUser = true;
      token = req.session?.jwt; // Assuming the JWT is stored in the session
      user = {
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role
      };
    }

    console.log('req.currentUser::::::', req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      isUser,
      token,
      user
    });
  }
}
