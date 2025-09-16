const allowedOrigins = [
  'https://www.yoursite.com',
  'http://127.0.0.1:5500',
  'http://localhost:3500',
  'http://localhost:3000',
  'http://localhost:5173'
];
import { Request, Response, NextFunction } from 'express';

export const corsCredentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin!;
  if (allowedOrigins.includes(origin)) {
    //@ts-expect-error argument of trype 'string' is not assignable to parameter of type 'string[]'
    res.header('Access-Control-Allow-Credentials', true);
  }
  next();
};
