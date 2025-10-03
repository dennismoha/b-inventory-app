/*
    This will receive the user email and password from the req.body
    we will check if that user email exists in the db
    if yes, compare the password hash with the  password. because we are using bcrypt
    if password not much return an error. 
    if password match create a jwt token and store it in a cookie
    return that
*/

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { AuthPayload, UserInterface } from '@src/features/auth/interfaces/auth.interface';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { config } from '@src/config';

export class Login {
  /**
   * Handles user login by validating email and password, and generating a JWT token if valid.
   *
   * @param {Request} req - The Express request object containing user credentials (email and password).
   * @param {Response} res - The Express response object to send the response.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password }: Pick<UserInterface, 'email' | 'password'> = req.body;

    // Check if user exists with the given email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestError('Invalid email or password');
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password');
    }

    // const parseIP = (req:Request) => req.headers['x-forwarded-for']?.split(',').shift() || req.connection.remoteAddress || req.socket?.remoteAddress || req.ip;

    console.log('req is ', req.ip);

    // 3️ Check if user already has an active login from another device

    // if (user.role === 'user') {
    //   // If the user is a super admin, allow login without checking for active sessions
    //   console.log('Super admin login allowed without active session check');
    //   const existingLogin = await prisma.userLoginLog.findFirst({
    //     where: {
    //       userId: user.user_id,
    //       isLoggedIn: true
    //     }
    //   });

    //   if (existingLogin) {
    //     const currentDevice = req.headers['user-agent'] || '';
    //     const currentIP = req.ip;

    //     // Log the failed login attempt
    //     await prisma.userLoginAttempt.create({
    //       data: {
    //         userId: user.user_id,
    //         attemptTime: new Date(),
    //         ipAddress: currentIP || 'unknown',
    //         userAgent: currentDevice,
    //         status: 'FAILED_ACTIVE_SESSION'
    //       }
    //     });

    //     throw new BadRequestError('You are already logged in on another device. Please log out from that device first.');
    //   }
    // }

    //  Register successful login
    await prisma.userLoginLog.create({
      data: {
        userId: user.user_id,
        loginTime: new Date(),
        logoutTime: null, // Set to null for active session
        terminalId: '', // Assuming terminalId is not required for login
        isLoggedIn: true // Mark as logged in
        // ipAddress: req.ip || 'unknown',
        // userAgent: req.headers['user-agent'] || ''
      }
    });

    //  Check if there's an active cash session for this user
    const posSession = await prisma.posSession.findFirst({
      where: { status: 'OPEN' },
      select: { pos_session_id: true }
    });

    // console.log('Active session:', posSession);

    const jwtTokenPayload: AuthPayload = {
      email: user.email,
      username: user.username,
      role: user.role,
      posSessionId: posSession?.pos_session_id || null
    };

    // 6 Generate token
    const token = jwt.sign(jwtTokenPayload, config.JWT_SECRET, { expiresIn: '1h' });

    // await prisma.userLoginLog.create({
    //   data: {
    //     userId: user.id,
    //     loginTime: new Date(),
    //     ipAddress: req.ip, // Store the IP address of the user
    //     userAgent: req.headers['user-agent'] || '' // Store the user agent for additional context
    //   }
    // });

    // Generate a JWT token
    // const token = jwt.sign(
    //   { email: user.email, username: user.username, role: user.role }, // Payload
    //   config.JWT_SECRET, // Secret key for signing the token
    //   { expiresIn: '1h' } // Token expiration time
    // );

    // req.session = { jwt: token };
    req.session = { jwt: token };

    req.currentUser = {
      email: user.email,
      username: user.username,
      role: user.role
      // posSessionId: posSession?.pos_session_id || null // Include the active session ID
    };

    // Return a success message (without sending the token directly in the response body)
    return res.status(200).json({
      message: 'Login successful',
      token,
      // posSessionId: posSession?.pos_session_id || null, // Include the active session ID if available
      user: {
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  }
  // public async login(req: Request, res: Response): Promise<Response> {
  //   const { email, password }: Pick<UserInterface, 'email' | 'password'> = req.body;

  //   // Check if user exists with the given email
  //   const user = await prisma.user.findUnique({
  //     where: { email }
  //   });

  //   if (!user) {
  //     throw new BadRequestError('Invalid email or password');
  //   }

  //   // Compare the provided password with the stored hashed password using bcrypt
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new BadRequestError('Invalid email or password');
  //   }

  //   // await Prisma.userLoginLog.create({
  //   //   data: {
  //   //     userId: user.id,
  //   //     loginTime: new Date(),
  //   //     ipAddress: req.ip, // Store the IP address of the user
  //   //     userAgent: req.headers['user-agent'] || '' // Store the user agent for additional context
  //   //   }
  //   // });

  //   // Generate a JWT token
  //   const token = jwt.sign(
  //     { email: user.email, username: user.username, role: user.role }, // Payload
  //     config.JWT_SECRET, // Secret key for signing the token
  //     { expiresIn: '1h' } // Token expiration time
  //   );

  //   req.session = { jwt: token };

  //   // Return a success message (without sending the token directly in the response body)
  //   return res.status(200).json({
  //     message: 'Login successful',
  //     token,
  //     user: {
  //       email: user.email,
  //       username: user.username,
  //       role: user.role
  //     }
  //   });
  // }
}
