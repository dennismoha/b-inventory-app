/*

So, this class will be responsible for adding user data to db
it'll be called from a script eg seed.ts.
this script will contain 
    username: string,
    email: 
    password
    role : admin or user

  This module will encrypt the password using bcrypt and store the password in the db as hashed. 
  Then we will return a 201 uccess process

  will also check if a user exists and throw a bad request error if he does

*/

// src/controllers/signupController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserInterface } from '@src/features/auth/interfaces/auth.interface';

import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database

import { ConflictError } from '@src/shared/globals/helpers/error-handler';
// import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';

export class Signup {
  /**
   * Creates multiple users, ensuring one user is assigned the "admin" role
   * and others are assigned the "user" role.
   *
   * @param {Request} req - The Express request object containing user details.
   * @param {Response} res - The Express response object to send the response.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  public async createUsers(req: Request, res: Response): Promise<Response> {
    const users: UserInterface[] = req.body;

    // Validate roles: ensure there is exactly one "admin" role and others are "user"
    const adminCount = users.filter((user) => user.role === 'admin').length;
    if (adminCount !== 1) {
      throw new ConflictError('There must be exactly one admin user.');
    }

    // Hash the passwords for all users and check if they already exist
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        // Check if the user already exists in the DB
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (existingUser) {
          throw new ConflictError(`User with email ${user.email} already exists`);
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );

    // Create the users in the database
    await prisma.user.createMany({
      data: hashedUsers
    });

    // Return the created users (excluding the passwords for security)
    return res.status(StatusCodes.CREATED).json({
      message: 'Users created successfully',
      createdUsers: hashedUsers.map((user) => ({
        username: user.username,
        email: user.email,
        role: user.role
      }))
    });
  }
}
