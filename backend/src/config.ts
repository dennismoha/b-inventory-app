import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined;
  public NODE_ENV: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public LOCAL_DEVELOPMENT_BASE_URL: string | undefined;
  public SECRET_COOKIE_KEY_ONE: string | undefined;
  public SECRET_COOKIE_KEY_TWO: string | undefined;
  public JWT_SECRET: string;

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_COOKIE_KEY_ONE = process.env.SECRETE_COOKIE_KEY_ONE || '';
    this.SECRET_COOKIE_KEY_TWO = process.env.SECRETE_COOKIE_KEY_TWO || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME;
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY;
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
    this.LOCAL_DEVELOPMENT_BASE_URL = process.env.LOCAL_DEVELOPMENT_BASE_URL;
    this.JWT_SECRET = process.env.JWT_SECRET!;
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`${key} configuration is undefined`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config: Config = new Config();
