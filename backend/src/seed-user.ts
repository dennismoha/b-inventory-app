import dotenv from 'dotenv';

import axios from 'axios';

dotenv.config({});

import { UserInterface } from './features/auth/interfaces/auth.interface';
import { BadRequestError } from './shared/globals/helpers/error-handler';

enum UserRole {
  // eslint-disable-next-line no-unused-vars
  admin = 'admin',
  // eslint-disable-next-line no-unused-vars
  user = 'user'
}

/**
 * Seed function to test user signup by sending a request with two users.
 * One user will be an admin and the other will be a regular user.
 */
async function seed() {
  const users: UserInterface[] = [
    {
      username: process.env.ADMIN_USERNAME as string, // Type assertion
      email: process.env.ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASSWORD as string,
      role: process.env.ADMIN_ROLE as UserRole.admin
    },

    // Normal user from environment variables
    {
      username: process.env.USER_USERNAME as string,
      email: process.env.USER_EMAIL as string,
      password: process.env.USER_PASSWORD as string,
      role: process.env.USER_ROLE as UserRole.user
    }
  ];

  const url =
    process.env.NODE_ENV === 'production'
      ? 'https://inventory-management-app-arkv.onrender.com/api/v1/signup'
      : 'http://localhost:8081/api/v1/signup';
  try {
    const response = await axios.post(url, users);
    console.log('Users created:', response.data);
  } catch (e: unknown) {
    if (typeof e === 'string') {
      e.toUpperCase(); // works, `e` narrowed to string
      console.log('e', e);
    } else if (e instanceof Error) {
      console.log(e.message);
    }
    throw new BadRequestError(`something went wrong ${e}`);
  }
}

seed();
