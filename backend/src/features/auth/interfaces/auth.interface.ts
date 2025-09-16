// src/types/user.ts

import { Role } from '@src/constants';
import { PosSession } from '@src/features/pos/interface/pos.interface';
import { UserRoles } from '@src/shared/globals/enums/ts.enums';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
      posLedgerId?: string;
      possession: string;
    }
  }
}

export interface UserInterface {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user'; // Ensuring the role can only be 'admin' or 'user'
}

export interface CreateUserRequest {
  users: UserInterface[];
}

export interface AuthPayload {
  // userId: string;
  email: string;
  username: string;
  role: Role;
  posSessionId?: string | null; // Optional, if the user has a POS session
}

export interface UserLoginAttempt {
  id: number;
  userId: string;
  attemptTime: Date;
  ipAddress: string;
  userAgent: string;
  status: string; // e.g. 'FAILED_ACTIVE_SESSION', 'WRONG_PASSWORD'
  user: User;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string;
  role: UserRoles;
  createdAt: Date;
  updatedAt: Date;

  UserLoginLog: UserLoginLog[];
  userLoginAttempt: UserLoginAttempt[];
  PosSessionOpened: PosSession[];
  PosSessionClosed: PosSession[];
}

export interface UserLoginLog {
  id: string;
  userId: string;
  loginTime: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}
