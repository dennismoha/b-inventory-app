// lib/prismaClient.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { config } from '@src/config';
import Logger from 'bunyan';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';

const logger: Logger = config.createLogger('prisma');
export const DecimalZero = new Prisma.Decimal(0);

// Create a single instance of Prisma Client
const prismaClient = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    },
    {
      emit: 'event',
      level: 'error'
    },
    {
      emit: 'event',
      level: 'info'
    },
    {
      emit: 'event',
      level: 'warn'
    }
  ]
});

export type PrismaTransactionalClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

// Log Prisma queries with the correct typing
prismaClient.$on('query', (e: Prisma.QueryEvent) => {
  logger.debug(`Prisma Query: ${e.query} - ${JSON.stringify(e.params)}`);
});

// Log Prisma errors
prismaClient.$on('error', (e: Prisma.LogEvent) => {
  logger.info('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeer===============', e);
  // Handle Prisma known errors

  const message = e.message || '';
  const target = e.target || 'Unknown field';
  const timestamp = e.timestamp || new Date().toISOString();

  // Use switch to handle different error scenarios based on the error message
  switch (true) {
    case message.includes('Unique constraint failed'):
      logger.error(`[${timestamp}] Unique constraint violation: ${target}`);
      throw new BadRequestError('Duplicate entry detected');

    case message.includes('Foreign key constraint violated'):
      logger.error(`[${timestamp}] Foreign key constraint violation: ${target}`);
      throw new BadRequestError('Invalid reference field');

    case message.includes('Invalid `prisma.'):
      logger.error(`[${timestamp}] Record not found: ${target}`);
      throw new BadRequestError('invalid fields');

    default:
      // Handle other types of errors that don't match known patterns
      logger.error(`[${timestamp}] Prisma error: ${message}`);
      throw new BadRequestError(`Prisma error occurred: ${message}`);
  }

  // if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //     logger.info('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeer', e);
  //     throw new BadRequestError(JSON.stringify(e.code));
  //     // if (e.code === 'P2002') {
  //     //   logger.error(
  //     //     `message: ${e.message}`
  //     //   );
  //     // } else {
  //     //   logger.error(`Prisma Error: ${e.message}`);
  //     // }
  //   } else {
  //     // Handle unexpected errors
  //     logger.error(`Unexpected error: ${e}`);
  //   }

  //   if (e instanceof Prisma.PrismaClientUnknownRequestError) {
  //     throw new BadRequestError('unknown error');
  //   }

  //   if(e instanceof Prisma.PrismaClientValidationError){
  //     throw new BadRequestError('prisma validation error');
  //   }

  //   if(e instanceof Prisma.PrismaClientRustPanicError){
  //     throw new BadRequestError('prisma client rust');
  //   }

  // if(e.message) {
  //     if (e.message.includes('Foreign key constraint violated')) {
  //         // const target = e.target || 'Unknown field';
  //         // logger.error(`Unique constraint violation: ${target}`);
  //         // throw new Error(`Duplicate entry detected for ${target}.`);
  //         throw new BadRequestError(JSON.stringify('unknown field'));
  //       }
  // }
  // throw new BadRequestError(JSON.stringify(e.message));
});

// Log Prisma info events (optional)
prismaClient.$on('info', (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

// Optionally, you can handle disconnections and log errors in this file
prismaClient.$connect().catch((e) => {
  console.error('Prisma Client connection error:', e);
});

export default prismaClient;
