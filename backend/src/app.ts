import express, { Express } from 'express';
import { ServerSetup } from '@src/setup-server';
import { config } from './config';
import setupDatabase from '@src/setup-database';

class Application {
  public initialize(): void {
    this.loadConfig();
    setupDatabase();
    const app: Express = express();
    const server: ServerSetup = new ServerSetup(app);
    server.Start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();
application.initialize();
