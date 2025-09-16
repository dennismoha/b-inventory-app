import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import compression from 'compression';
import Logger from 'bunyan';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
// import swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yamljs';

import { config } from '@src/config';
import ApplicationRoutes from '@src/routes';
import { CustomError } from '@src/shared/globals/helpers/error-handler';
import { BASE_PATH, SERVER_PORT } from '@src/constants';
import { corsCredentials } from './shared/globals/helpers/cors-credentials-middleware';
// import { PrismaClient, Prisma } from '@prisma/client';
// const prisma = new PrismaClient();

const log: Logger = config.createLogger('server');
const swaggerDocument = YAML.load('./openapi.yaml');

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  serializeErrors(): IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export class ServerSetup {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public Start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.swaggerUISetup(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    // app.use(
    //   cookieSession({
    //     name: 'session',
    //     keys: [config.SECRET_COOKIE_KEY_ONE!, config.SECRET_COOKIE_KEY_TWO!],
    //     maxAge: 24 * 7 * 3600000,
    //     secure: config.NODE_ENV !== 'development',
    //     // secure: false,
    //     // signed: false,
    //     // httpOnly: false,
    //     sameSite: 'none'
    //   })
    // );
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_COOKIE_KEY_ONE!, config.SECRET_COOKIE_KEY_TWO!],
        maxAge: 24 * 7 * 3600000, // 7 days
        // secure: false, // false for HTTP (dev only)
        httpOnly: true, //  better to keep this true
        signed: true //  match middleware expectations
        // sameSite: 'lax' //  for dev; avoids SameSite=None + Secure issue
      })
    );
    app.use(cookieParser()); // Use cookie-parser to access cookies in req.cookie
    app.use(hpp());
    app.use(helmet());
    app.use(corsCredentials);
    app.use(
      cors({
        origin: 'http://localhost:8080',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }
  private routeMiddleware(app: Application): void {
    ApplicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response) => {
      log.error('not found');
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error('global error:', error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }

      next();
    });
  }
  private swaggerUISetup(app: Application) {
    const baseURL = `${config.LOCAL_DEVELOPMENT_BASE_URL}${BASE_PATH}`;
    swaggerDocument.servers = [{ url: baseURL }];
    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  // creating http server
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.log('error is ', error);
    }
  }

  // calling the listen method
  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(SERVER_PORT, () => {
      log.info('server running ', SERVER_PORT);
    });
  }
}
